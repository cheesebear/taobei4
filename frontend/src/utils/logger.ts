/**
 * 日志记录工具类
 * 提供统一的日志记录、分级管理和输出功能
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: number;
  context?: string;
  data?: any;
  userId?: string;
  sessionId?: string;
}

export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = LogLevel.INFO;
  private logs: LogEntry[] = [];
  private maxLogSize = 1000;
  private sessionId: string;

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.setLogLevel();
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * 设置日志级别
   */
  private setLogLevel(): void {
    if (process.env.NODE_ENV === 'development') {
      this.logLevel = LogLevel.DEBUG;
    } else if (process.env.NODE_ENV === 'production') {
      this.logLevel = LogLevel.WARN;
    } else {
      this.logLevel = LogLevel.INFO;
    }
  }

  /**
   * 生成会话ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 记录调试日志
   */
  public debug(message: string, data?: any, context?: string): void {
    this.log(LogLevel.DEBUG, message, data, context);
  }

  /**
   * 记录信息日志
   */
  public info(message: string, data?: any, context?: string): void {
    this.log(LogLevel.INFO, message, data, context);
  }

  /**
   * 记录警告日志
   */
  public warn(message: string, data?: any, context?: string): void {
    this.log(LogLevel.WARN, message, data, context);
  }

  /**
   * 记录错误日志
   */
  public error(message: string, data?: any, context?: string): void {
    this.log(LogLevel.ERROR, message, data, context);
  }

  /**
   * 核心日志记录方法
   */
  private log(
    level: LogLevel,
    message: string,
    data?: any,
    context?: string
  ): void {
    // 检查日志级别
    if (level < this.logLevel) {
      return;
    }

    const logEntry: LogEntry = {
      level,
      message,
      timestamp: Date.now(),
      context,
      data,
      userId: this.getCurrentUserId(),
      sessionId: this.sessionId,
    };

    // 添加到日志数组
    this.addToLogs(logEntry);

    // 输出到控制台
    this.outputToConsole(logEntry);

    // 发送到服务器（仅生产环境的错误和警告）
    if (process.env.NODE_ENV === 'production' && level >= LogLevel.WARN) {
      this.sendToServer(logEntry);
    }
  }

  /**
   * 添加日志到数组
   */
  private addToLogs(logEntry: LogEntry): void {
    this.logs.push(logEntry);

    // 保持日志数组大小在限制范围内
    if (this.logs.length > this.maxLogSize) {
      this.logs.shift();
    }
  }

  /**
   * 输出到控制台
   */
  private outputToConsole(logEntry: LogEntry): void {
    const timestamp = new Date(logEntry.timestamp).toISOString();
    const levelName = LogLevel[logEntry.level];
    const prefix = `[${timestamp}] [${levelName}]`;
    const contextStr = logEntry.context ? ` [${logEntry.context}]` : '';
    const fullMessage = `${prefix}${contextStr} ${logEntry.message}`;

    switch (logEntry.level) {
      case LogLevel.DEBUG:
        console.debug(fullMessage, logEntry.data);
        break;
      case LogLevel.INFO:
        console.info(fullMessage, logEntry.data);
        break;
      case LogLevel.WARN:
        console.warn(fullMessage, logEntry.data);
        break;
      case LogLevel.ERROR:
        console.error(fullMessage, logEntry.data);
        break;
    }
  }

  /**
   * 发送日志到服务器
   */
  private async sendToServer(logEntry: LogEntry): Promise<void> {
    try {
      // 这里应该调用实际的日志上报API
      // await api.post('/api/logs', logEntry);
      console.log('Log sent to server:', logEntry);
    } catch (error) {
      // 忽略日志上报失败，避免无限循环
      console.warn('Failed to send log to server:', error);
    }
  }

  /**
   * 获取当前用户ID
   */
  private getCurrentUserId(): string | undefined {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id;
      }
    } catch (e) {
      // 忽略解析错误
    }
    return undefined;
  }

  /**
   * 获取所有日志
   */
  public getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logs.filter(log => log.level >= level);
    }
    return [...this.logs];
  }

  /**
   * 清空日志
   */
  public clearLogs(): void {
    this.logs = [];
  }

  /**
   * 导出日志为JSON
   */
  public exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * 设置日志级别
   */
  public setLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * 获取当前日志级别
   */
  public getLevel(): LogLevel {
    return this.logLevel;
  }

  /**
   * 记录API请求
   */
  public logApiRequest(method: string, url: string, data?: any): void {
    this.debug(`API Request: ${method.toUpperCase()} ${url}`, data, 'API');
  }

  /**
   * 记录API响应
   */
  public logApiResponse(
    method: string,
    url: string,
    status: number,
    data?: any
  ): void {
    const message = `API Response: ${method.toUpperCase()} ${url} - ${status}`;
    if (status >= 400) {
      this.error(message, data, 'API');
    } else {
      this.debug(message, data, 'API');
    }
  }

  /**
   * 记录用户行为
   */
  public logUserAction(action: string, data?: any): void {
    this.info(`User Action: ${action}`, data, 'USER');
  }

  /**
   * 记录页面访问
   */
  public logPageView(path: string, data?: any): void {
    this.info(`Page View: ${path}`, data, 'NAVIGATION');
  }

  /**
   * 记录性能指标
   */
  public logPerformance(
    metric: string,
    value: number,
    unit: string = 'ms'
  ): void {
    this.info(
      `Performance: ${metric} = ${value}${unit}`,
      { metric, value, unit },
      'PERFORMANCE'
    );
  }
}

// 导出单例实例
export const logger = Logger.getInstance();

// 便捷的日志记录函数
export const log = {
  debug: (message: string, data?: any, context?: string) =>
    logger.debug(message, data, context),
  info: (message: string, data?: any, context?: string) =>
    logger.info(message, data, context),
  warn: (message: string, data?: any, context?: string) =>
    logger.warn(message, data, context),
  error: (message: string, data?: any, context?: string) =>
    logger.error(message, data, context),
  apiRequest: (method: string, url: string, data?: any) =>
    logger.logApiRequest(method, url, data),
  apiResponse: (method: string, url: string, status: number, data?: any) =>
    logger.logApiResponse(method, url, status, data),
  userAction: (action: string, data?: any) =>
    logger.logUserAction(action, data),
  pageView: (path: string, data?: any) => logger.logPageView(path, data),
  performance: (metric: string, value: number, unit?: string) =>
    logger.logPerformance(metric, value, unit),
};
