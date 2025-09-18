/**
 * 错误处理工具类
 * 提供统一的错误处理、日志记录和用户提示功能
 */

export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  BUSINESS_ERROR = 'BUSINESS_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface AppError {
  type: ErrorType;
  message: string;
  code?: string | number;
  details?: any;
  timestamp: number;
  stack?: string;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorQueue: AppError[] = [];
  private maxQueueSize = 100;

  private constructor() {}

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * 处理错误
   */
  public handleError(error: any, context?: string): AppError {
    const appError = this.normalizeError(error, context);

    // 记录错误日志
    this.logError(appError, context);

    // 添加到错误队列
    this.addToQueue(appError);

    // 显示用户友好的错误提示
    this.showUserMessage(appError);

    return appError;
  }

  /**
   * 标准化错误对象
   */
  private normalizeError(error: any, context?: string): AppError {
    let appError: AppError;

    if (error.response) {
      // HTTP 错误响应
      const status = error.response.status;
      const data = error.response.data;

      if (status === 401) {
        appError = {
          type: ErrorType.AUTH_ERROR,
          message: '登录已过期，请重新登录',
          code: status,
          details: data,
          timestamp: Date.now(),
        };
      } else if (status >= 400 && status < 500) {
        appError = {
          type: ErrorType.API_ERROR,
          message: data?.message || '请求参数错误',
          code: status,
          details: data,
          timestamp: Date.now(),
        };
      } else if (status >= 500) {
        appError = {
          type: ErrorType.API_ERROR,
          message: '服务器内部错误，请稍后重试',
          code: status,
          details: data,
          timestamp: Date.now(),
        };
      } else {
        appError = {
          type: ErrorType.API_ERROR,
          message: data?.message || '请求失败',
          code: status,
          details: data,
          timestamp: Date.now(),
        };
      }
    } else if (error.request) {
      // 网络错误
      appError = {
        type: ErrorType.NETWORK_ERROR,
        message: '网络连接失败，请检查网络设置',
        details: error.request,
        timestamp: Date.now(),
      };
    } else if (error instanceof Error) {
      // JavaScript 错误
      appError = {
        type: ErrorType.UNKNOWN_ERROR,
        message: error.message || '发生未知错误',
        stack: error.stack,
        timestamp: Date.now(),
      };
    } else if (typeof error === 'string') {
      // 字符串错误
      appError = {
        type: ErrorType.BUSINESS_ERROR,
        message: error,
        timestamp: Date.now(),
      };
    } else {
      // 其他类型错误
      appError = {
        type: ErrorType.UNKNOWN_ERROR,
        message: '发生未知错误',
        details: error,
        timestamp: Date.now(),
      };
    }

    return appError;
  }

  /**
   * 记录错误日志
   */
  private logError(error: AppError, context?: string): void {
    const logData = {
      ...error,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getCurrentUserId(),
    };

    // 开发环境下在控制台输出详细错误信息
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error [${error.type}]`);
      console.error('Message:', error.message);
      console.error('Code:', error.code);
      console.error('Context:', context);
      console.error('Details:', error.details);
      if (error.stack) {
        console.error('Stack:', error.stack);
      }
      console.groupEnd();
    }

    // 生产环境下发送错误日志到服务器
    if (process.env.NODE_ENV === 'production') {
      this.sendErrorToServer(logData);
    }
  }

  /**
   * 显示用户友好的错误提示
   */
  private showUserMessage(error: AppError): void {
    // 这里可以集成 Toast 组件或其他提示组件
    // 暂时使用 console.warn 作为占位符
    console.warn('User Message:', error.message);

    // 如果是认证错误，可以触发登出逻辑
    if (error.type === ErrorType.AUTH_ERROR) {
      this.handleAuthError();
    }
  }

  /**
   * 添加错误到队列
   */
  private addToQueue(error: AppError): void {
    this.errorQueue.push(error);

    // 保持队列大小在限制范围内
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }
  }

  /**
   * 获取当前用户ID
   */
  private getCurrentUserId(): string | null {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id || null;
      }
    } catch (e) {
      // 忽略解析错误
    }
    return null;
  }

  /**
   * 发送错误日志到服务器
   */
  private async sendErrorToServer(logData: any): Promise<void> {
    try {
      // 这里应该调用实际的日志上报API
      // await api.post('/api/logs/error', logData);
      console.log('Error logged to server:', logData);
    } catch (e) {
      // 忽略日志上报失败
      console.warn('Failed to send error log to server:', e);
    }
  }

  /**
   * 处理认证错误
   */
  private handleAuthError(): void {
    // 清除本地存储的用户信息
    localStorage.removeItem('user');
    localStorage.removeItem('token');

    // 重定向到登录页面
    // 这里应该使用路由跳转
    console.log('Redirecting to login page...');
  }

  /**
   * 获取错误队列
   */
  public getErrorQueue(): AppError[] {
    return [...this.errorQueue];
  }

  /**
   * 清空错误队列
   */
  public clearErrorQueue(): void {
    this.errorQueue = [];
  }

  /**
   * 创建业务错误
   */
  public static createBusinessError(
    message: string,
    code?: string | number
  ): AppError {
    return {
      type: ErrorType.BUSINESS_ERROR,
      message,
      code,
      timestamp: Date.now(),
    };
  }

  /**
   * 创建验证错误
   */
  public static createValidationError(
    message: string,
    details?: any
  ): AppError {
    return {
      type: ErrorType.VALIDATION_ERROR,
      message,
      details,
      timestamp: Date.now(),
    };
  }
}

// 导出单例实例
export const errorHandler = ErrorHandler.getInstance();

// 全局错误处理函数
export const handleGlobalError = (error: any, context?: string): AppError => {
  return errorHandler.handleError(error, context);
};
