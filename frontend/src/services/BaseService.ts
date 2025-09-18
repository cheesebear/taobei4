/**
 * 基础API服务类
 * 提供通用的API调用方法和错误处理逻辑
 */

import { apiClient, ApiError } from './api';
import { ApiResponse, PaginatedResponse } from '../types/user';
import { errorHandler, log } from '../utils';

/**
 * 基础服务类
 * 所有API服务类的基类，提供通用方法
 */
export abstract class BaseService {
  protected readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * GET请求
   */
  protected async get<T>(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<T> {
    try {
      const response = await apiClient.get<T>(`${this.baseUrl}${endpoint}`, {
        params,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, `GET ${this.baseUrl}${endpoint}`);
    }
  }

  /**
   * POST请求
   */
  protected async post<T>(
    endpoint: string,
    data?: any,
    config?: any
  ): Promise<T> {
    try {
      const response = await apiClient.post<T>(
        `${this.baseUrl}${endpoint}`,
        data,
        config
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, `POST ${this.baseUrl}${endpoint}`);
    }
  }

  /**
   * PUT请求
   */
  protected async put<T>(
    endpoint: string,
    data?: any,
    config?: any
  ): Promise<T> {
    try {
      const response = await apiClient.put<T>(
        `${this.baseUrl}${endpoint}`,
        data,
        config
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, `PUT ${this.baseUrl}${endpoint}`);
    }
  }

  /**
   * DELETE请求
   */
  protected async delete<T>(endpoint: string, config?: any): Promise<T> {
    try {
      const response = await apiClient.delete<T>(
        `${this.baseUrl}${endpoint}`,
        config
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, `DELETE ${this.baseUrl}${endpoint}`);
    }
  }

  /**
   * 分页GET请求
   */
  protected async getPaginated<T>(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<PaginatedResponse<T>> {
    try {
      const response = await apiClient.getPaginated<T>(
        `${this.baseUrl}${endpoint}`,
        { params }
      );
      return response;
    } catch (error) {
      throw this.handleError(
        error,
        `GET ${this.baseUrl}${endpoint} (paginated)`
      );
    }
  }

  /**
   * 统一错误处理
   */
  protected handleError(error: any, context: string): ApiError {
    // 记录错误日志
    log.error(`API Error in ${context}:`, error, this.constructor.name);

    // 使用统一的错误处理器
    const handledError = errorHandler.handleError(error, context);

    // 如果是ApiError，直接抛出
    if (handledError instanceof ApiError) {
      return handledError;
    }

    // 否则包装成ApiError
    return new ApiError(
      handledError.message || '请求失败',
      'API_ERROR',
      error.response?.status,
      error.response?.data?.code,
      error.response?.data,
      error
    );
  }

  /**
   * 构建查询参数
   */
  protected buildParams(params: Record<string, any>): Record<string, any> {
    const cleanParams: Record<string, any> = {};

    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value !== undefined && value !== null && value !== '') {
        cleanParams[key] = value;
      }
    });

    return cleanParams;
  }

  /**
   * 格式化错误消息
   */
  protected formatErrorMessage(error: any, defaultMessage: string): string {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    if (error.message) {
      return error.message;
    }

    return defaultMessage;
  }

  /**
   * 检查响应是否成功
   */
  protected isSuccessResponse<T>(response: ApiResponse<T>): boolean {
    return response.success === true;
  }

  /**
   * 提取响应数据
   */
  protected extractResponseData<T>(response: ApiResponse<T>): T {
    if (!this.isSuccessResponse(response)) {
      throw new ApiError(
        response.message || '请求失败',
        'API_ERROR',
        response.code
      );
    }

    return response.data;
  }

  /**
   * 重试机制
   */
  protected async retry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: any;

    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        // 如果是最后一次重试，直接抛出错误
        if (i === maxRetries) {
          break;
        }

        // 如果是认证错误或客户端错误，不重试
        if (error.response?.status >= 400 && error.response?.status < 500) {
          break;
        }

        // 等待后重试
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }

    throw lastError;
  }

  /**
   * 缓存机制（简单实现）
   */
  private cache = new Map<
    string,
    { data: any; timestamp: number; ttl: number }
  >();

  protected async getWithCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 5 * 60 * 1000 // 5分钟
  ): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();

    // 检查缓存是否有效
    if (cached && now - cached.timestamp < cached.ttl) {
      return cached.data;
    }

    // 获取新数据
    const data = await fetcher();

    // 存储到缓存
    this.cache.set(key, {
      data,
      timestamp: now,
      ttl,
    });

    return data;
  }

  /**
   * 清除缓存
   */
  protected clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
}

export default BaseService;
