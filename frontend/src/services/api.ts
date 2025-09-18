// 基础API客户端
// 提供HTTP请求封装、错误处理、认证拦截器等功能

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import { ApiResponse, PaginatedResponse } from '../types/user';
import { errorHandler, log } from '../utils';

/**
 * API配置接口
 */
interface ApiConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

/**
 * 请求拦截器配置
 */
interface RequestInterceptorConfig {
  onRequest?: (
    config: InternalAxiosRequestConfig
  ) => InternalAxiosRequestConfig;
  onRequestError?: (error: any) => Promise<any>;
}

/**
 * 响应拦截器配置
 */
interface ResponseInterceptorConfig {
  onResponse?: (response: AxiosResponse) => AxiosResponse;
  onResponseError?: (error: AxiosError) => Promise<any>;
}

/**
 * API错误类型
 */
export enum ApiErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * API错误类
 */
export class ApiError extends Error {
  public readonly type: ApiErrorType;
  public readonly status?: number;
  public readonly code?: string;
  public readonly data?: any;
  public readonly originalError?: AxiosError;

  constructor(
    message: string,
    type: ApiErrorType,
    status?: number,
    code?: string,
    data?: any,
    originalError?: AxiosError
  ) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.status = status;
    this.code = code;
    this.data = data;
    this.originalError = originalError;
  }
}

/**
 * 默认API配置
 */
const DEFAULT_CONFIG: ApiConfig = {
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api',
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,
};

/**
 * API客户端类
 */
export class ApiClient {
  private instance: AxiosInstance;
  private config: ApiConfig;
  private authToken: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
  }> = [];

  constructor(config: Partial<ApiConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.instance = this.createAxiosInstance();
    this.setupInterceptors();
  }

  /**
   * 创建Axios实例
   */
  private createAxiosInstance(): AxiosInstance {
    return axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
  }

  /**
   * 设置拦截器
   */
  private setupInterceptors(): void {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // 记录API请求日志
        log.apiRequest(
          config.method?.toUpperCase() || 'GET',
          config.url || '',
          config.data
        );

        // 添加认证token
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }

        // 添加请求ID用于追踪
        config.headers['X-Request-ID'] = this.generateRequestId();

        // 添加时间戳
        config.headers['X-Request-Time'] = new Date().toISOString();

        console.log(
          `[API Request] ${config.method?.toUpperCase()} ${config.url}`,
          {
            headers: config.headers,
            params: config.params,
            data: config.data,
          }
        );

        return config;
      },
      error => {
        // 记录请求错误
        log.error('API Request Error', error, 'API');
        console.error('[API Request Error]', error);
        return Promise.reject(errorHandler.handleError(error, 'API_REQUEST'));
      }
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        // 记录API响应日志
        const method = response.config.method?.toUpperCase() || 'GET';
        const url = response.config.url || '';
        log.apiResponse(method, url, response.status, response.data);

        // 记录响应时间
        const duration =
          Date.now() - (response.config as any).metadata?.startTime;
        if (duration) {
          log.performance(`API ${method} ${url}`, duration);
        }

        return response;
      },
      async (error: AxiosError) => {
        // 记录响应错误
        const method = error.config?.method?.toUpperCase() || 'GET';
        const url = error.config?.url || '';
        const status = error.response?.status || 0;
        log.apiResponse(method, url, status, error.response?.data);

        // 处理401认证错误
        if (error.response?.status === 401 && this.refreshToken) {
          return this.handleAuthError(error);
        }

        return Promise.reject(errorHandler.handleError(error, 'API_RESPONSE'));
      }
    );
  }

  /**
   * 处理认证错误
   */
  private async handleAuthError(error: AxiosError): Promise<any> {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (originalRequest._retry) {
      // 已经重试过，清除token并跳转到登录页
      this.clearAuth();
      return Promise.reject(this.handleError(error));
    }

    if (this.isRefreshing) {
      // 正在刷新token，将请求加入队列
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      });
    }

    originalRequest._retry = true;
    this.isRefreshing = true;

    try {
      // 刷新token
      const newToken = await this.refreshAuthToken();
      this.setAuthToken(newToken);

      // 处理队列中的请求
      this.processQueue(null, newToken);

      // 重新发送原始请求
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return this.instance(originalRequest);
    } catch (refreshError) {
      // 刷新失败，清除认证信息
      this.processQueue(refreshError, null);
      this.clearAuth();
      return Promise.reject(this.handleError(error));
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * 处理队列中的请求
   */
  private processQueue(error: any, token: string | null): void {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });

    this.failedQueue = [];
  }

  /**
   * 刷新认证token
   */
  private async refreshAuthToken(): Promise<string> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(`${this.config.baseURL}/auth/refresh`, {
      refreshToken: this.refreshToken,
    });

    const { accessToken, refreshToken } = response.data.data;
    this.refreshToken = refreshToken;

    return accessToken;
  }

  /**
   * 处理错误
   */
  private handleError(error: AxiosError | Error): ApiError {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status;
      const data = axiosError.response?.data;

      // 网络错误
      if (!axiosError.response) {
        if (axiosError.code === 'ECONNABORTED') {
          return new ApiError(
            '请求超时，请检查网络连接',
            ApiErrorType.TIMEOUT_ERROR,
            undefined,
            axiosError.code,
            undefined,
            axiosError
          );
        }
        return new ApiError(
          '网络连接失败，请检查网络设置',
          ApiErrorType.NETWORK_ERROR,
          undefined,
          axiosError.code,
          undefined,
          axiosError
        );
      }

      // HTTP状态码错误
      switch (status) {
        case 400:
          return new ApiError(
            data?.message || '请求参数错误',
            ApiErrorType.VALIDATION_ERROR,
            status,
            data?.code,
            data,
            axiosError
          );
        case 401:
          return new ApiError(
            data?.message || '认证失败，请重新登录',
            ApiErrorType.AUTH_ERROR,
            status,
            data?.code,
            data,
            axiosError
          );
        case 403:
          return new ApiError(
            data?.message || '权限不足',
            ApiErrorType.AUTH_ERROR,
            status,
            data?.code,
            data,
            axiosError
          );
        case 404:
          return new ApiError(
            data?.message || '请求的资源不存在',
            ApiErrorType.VALIDATION_ERROR,
            status,
            data?.code,
            data,
            axiosError
          );
        case 422:
          return new ApiError(
            data?.message || '数据验证失败',
            ApiErrorType.VALIDATION_ERROR,
            status,
            data?.code,
            data,
            axiosError
          );
        case 500:
        case 502:
        case 503:
        case 504:
          return new ApiError(
            data?.message || '服务器错误，请稍后重试',
            ApiErrorType.SERVER_ERROR,
            status,
            data?.code,
            data,
            axiosError
          );
        default:
          return new ApiError(
            data?.message || `请求失败 (${status})`,
            ApiErrorType.UNKNOWN_ERROR,
            status,
            data?.code,
            data,
            axiosError
          );
      }
    }

    // 其他错误
    return new ApiError(
      error.message || '未知错误',
      ApiErrorType.UNKNOWN_ERROR
    );
  }

  /**
   * 生成请求ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 设置认证token
   */
  public setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * 设置刷新token
   */
  public setRefreshToken(token: string): void {
    this.refreshToken = token;
  }

  /**
   * 清除认证信息
   */
  public clearAuth(): void {
    this.authToken = null;
    this.refreshToken = null;
  }

  /**
   * GET请求
   */
  public async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  /**
   * POST请求
   */
  public async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.post<ApiResponse<T>>(
      url,
      data,
      config
    );
    return response.data;
  }

  /**
   * PUT请求
   */
  public async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  /**
   * PATCH请求
   */
  public async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.patch<ApiResponse<T>>(
      url,
      data,
      config
    );
    return response.data;
  }

  /**
   * DELETE请求
   */
  public async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  /**
   * 分页GET请求
   */
  public async getPaginated<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<PaginatedResponse<T>> {
    const response = await this.instance.get<PaginatedResponse<T>>(url, config);
    return response.data;
  }

  /**
   * 上传文件
   */
  public async upload<T = any>(
    url: string,
    file: File,
    onUploadProgress?: (progressEvent: any) => void,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.instance.post<ApiResponse<T>>(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });

    return response.data;
  }

  /**
   * 下载文件
   */
  public async download(
    url: string,
    filename?: string,
    config?: AxiosRequestConfig
  ): Promise<void> {
    const response = await this.instance.get(url, {
      ...config,
      responseType: 'blob',
    });

    // 创建下载链接
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }

  /**
   * 重试请求
   */
  public async retry<T>(
    requestFn: () => Promise<T>,
    attempts: number = this.config.retryAttempts,
    delay: number = this.config.retryDelay
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error) {
      if (attempts <= 1) {
        throw error;
      }

      await new Promise(resolve => setTimeout(resolve, delay));
      return this.retry(requestFn, attempts - 1, delay * 2);
    }
  }

  /**
   * 批量请求
   */
  public async batch<T>(
    requests: Array<() => Promise<T>>,
    concurrency: number = 5
  ): Promise<T[]> {
    const results: T[] = [];
    const executing: Promise<void>[] = [];

    for (const request of requests) {
      const promise = request().then(result => {
        results.push(result);
      });

      executing.push(promise);

      if (executing.length >= concurrency) {
        await Promise.race(executing);
        executing.splice(
          executing.findIndex(p => p === promise),
          1
        );
      }
    }

    await Promise.all(executing);
    return results;
  }

  /**
   * 获取实例配置
   */
  public getConfig(): ApiConfig {
    return { ...this.config };
  }

  /**
   * 更新配置
   */
  public updateConfig(config: Partial<ApiConfig>): void {
    this.config = { ...this.config, ...config };
    this.instance.defaults.baseURL = this.config.baseURL;
    this.instance.defaults.timeout = this.config.timeout;
  }
}

// 创建默认API客户端实例
export const apiClient = new ApiClient();

// 导出便捷方法
export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<T>(url, config),
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.post<T>(url, data, config),
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.put<T>(url, data, config),
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.patch<T>(url, data, config),
  delete: <T = any>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<T>(url, config),
  getPaginated: <T = any>(url: string, config?: AxiosRequestConfig) =>
    apiClient.getPaginated<T>(url, config),
  upload: <T = any>(
    url: string,
    file: File,
    onUploadProgress?: (progressEvent: any) => void,
    config?: AxiosRequestConfig
  ) => apiClient.upload<T>(url, file, onUploadProgress, config),
  download: (url: string, filename?: string, config?: AxiosRequestConfig) =>
    apiClient.download(url, filename, config),
};

// 导出类型
export type { ApiConfig, RequestInterceptorConfig, ResponseInterceptorConfig };
