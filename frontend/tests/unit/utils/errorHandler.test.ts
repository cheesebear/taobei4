import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  ErrorHandler,
  ErrorType,
  AppError,
  errorHandler,
  handleGlobalError
} from '../../../src/utils/errorHandler';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock console methods
const consoleMock = {
  group: vi.fn(),
  groupEnd: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  log: vi.fn(),
};

Object.defineProperty(console, 'group', { value: consoleMock.group });
Object.defineProperty(console, 'groupEnd', { value: consoleMock.groupEnd });
Object.defineProperty(console, 'error', { value: consoleMock.error });
Object.defineProperty(console, 'warn', { value: consoleMock.warn });
Object.defineProperty(console, 'log', { value: consoleMock.log });

// Mock navigator
Object.defineProperty(navigator, 'userAgent', {
  value: 'Mozilla/5.0 (Test Browser)',
  configurable: true
});

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000/test'
  },
  configurable: true
});

// Mock process.env
const originalEnv = process.env.NODE_ENV;

describe('ErrorHandler', () => {
  let handler: ErrorHandler;

  beforeEach(() => {
    handler = ErrorHandler.getInstance();
    vi.clearAllMocks();
    handler.clearErrorQueue();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = ErrorHandler.getInstance();
      const instance2 = ErrorHandler.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('handleError', () => {
    it('should handle HTTP 401 error', () => {
      const error = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      };

      const result = handler.handleError(error, 'test context');

      expect(result.type).toBe(ErrorType.AUTH_ERROR);
      expect(result.message).toBe('登录已过期，请重新登录');
      expect(result.code).toBe(401);
      expect(result.timestamp).toBeDefined();
    });

    it('should handle HTTP 400 error', () => {
      const error = {
        response: {
          status: 400,
          data: { message: 'Bad Request' }
        }
      };

      const result = handler.handleError(error);

      expect(result.type).toBe(ErrorType.API_ERROR);
      expect(result.message).toBe('Bad Request');
      expect(result.code).toBe(400);
    });

    it('should handle HTTP 500 error', () => {
      const error = {
        response: {
          status: 500,
          data: {}
        }
      };

      const result = handler.handleError(error);

      expect(result.type).toBe(ErrorType.API_ERROR);
      expect(result.message).toBe('服务器内部错误，请稍后重试');
      expect(result.code).toBe(500);
    });

    it('should handle network error', () => {
      const error = {
        request: { timeout: 5000 }
      };

      const result = handler.handleError(error);

      expect(result.type).toBe(ErrorType.NETWORK_ERROR);
      expect(result.message).toBe('网络连接失败，请检查网络设置');
      expect(result.details).toBe(error.request);
    });

    it('should handle JavaScript Error', () => {
      const error = new Error('Test error');
      error.stack = 'Error stack trace';

      const result = handler.handleError(error);

      expect(result.type).toBe(ErrorType.UNKNOWN_ERROR);
      expect(result.message).toBe('Test error');
      expect(result.stack).toBe('Error stack trace');
    });

    it('should handle string error', () => {
      const error = 'String error message';

      const result = handler.handleError(error);

      expect(result.type).toBe(ErrorType.BUSINESS_ERROR);
      expect(result.message).toBe('String error message');
    });

    it('should handle unknown error type', () => {
      const error = { unknown: 'error' };

      const result = handler.handleError(error);

      expect(result.type).toBe(ErrorType.UNKNOWN_ERROR);
      expect(result.message).toBe('发生未知错误');
      expect(result.details).toBe(error);
    });

    it('should add error to queue', () => {
      const error = 'Test error';
      handler.handleError(error);

      const queue = handler.getErrorQueue();
      expect(queue).toHaveLength(1);
      expect(queue[0].message).toBe('Test error');
    });

    it('should limit queue size', () => {
      // Add more than maxQueueSize errors
      for (let i = 0; i < 105; i++) {
        handler.handleError(`Error ${i}`);
      }

      const queue = handler.getErrorQueue();
      expect(queue.length).toBeLessThanOrEqual(100);
    });
  });

  describe('logging in development', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    it('should log detailed error in development', () => {
      const error = new Error('Test error');
      handler.handleError(error, 'test context');

      expect(consoleMock.group).toHaveBeenCalledWith('🚨 Error [UNKNOWN_ERROR]');
      expect(consoleMock.error).toHaveBeenCalledWith('Message:', 'Test error');
      expect(consoleMock.error).toHaveBeenCalledWith('Context:', 'test context');
      expect(consoleMock.groupEnd).toHaveBeenCalled();
    });
  });

  describe('logging in production', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    it('should send error to server in production', () => {
      const error = new Error('Test error');
      handler.handleError(error);

      expect(consoleMock.log).toHaveBeenCalledWith(
        'Error logged to server:',
        expect.objectContaining({
          type: ErrorType.UNKNOWN_ERROR,
          message: 'Test error',
          userAgent: 'Mozilla/5.0 (Test Browser)',
          url: 'http://localhost:3000/test'
        })
      );
    });
  });

  describe('auth error handling', () => {
    it('should clear localStorage on auth error', () => {
      const error = {
        response: {
          status: 401,
          data: {}
        }
      };

      handler.handleError(error);

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    });
  });

  describe('getCurrentUserId', () => {
    it('should get user ID from localStorage', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ id: 'user123' }));
      
      const error = new Error('Test');
      handler.handleError(error);

      // Check if the user ID is included in the log data
      expect(localStorageMock.getItem).toHaveBeenCalledWith('user');
    });

    it('should handle invalid JSON in localStorage', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');
      
      const error = new Error('Test');
      // Should not throw error
      expect(() => handler.handleError(error)).not.toThrow();
    });

    it('should handle null user in localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const error = new Error('Test');
      // Should not throw error
      expect(() => handler.handleError(error)).not.toThrow();
    });
  });

  describe('queue management', () => {
    it('should get error queue', () => {
      handler.handleError('Error 1');
      handler.handleError('Error 2');

      const queue = handler.getErrorQueue();
      expect(queue).toHaveLength(2);
      expect(queue[0].message).toBe('Error 1');
      expect(queue[1].message).toBe('Error 2');
    });

    it('should clear error queue', () => {
      handler.handleError('Error 1');
      handler.handleError('Error 2');
      
      expect(handler.getErrorQueue()).toHaveLength(2);
      
      handler.clearErrorQueue();
      expect(handler.getErrorQueue()).toHaveLength(0);
    });
  });

  describe('static error creation methods', () => {
    it('should create business error', () => {
      const error = ErrorHandler.createBusinessError('Business error', 'BIZ001');

      expect(error.type).toBe(ErrorType.BUSINESS_ERROR);
      expect(error.message).toBe('Business error');
      expect(error.code).toBe('BIZ001');
      expect(error.timestamp).toBeDefined();
    });

    it('should create validation error', () => {
      const details = { field: 'email', value: 'invalid' };
      const error = ErrorHandler.createValidationError('Validation failed', details);

      expect(error.type).toBe(ErrorType.VALIDATION_ERROR);
      expect(error.message).toBe('Validation failed');
      expect(error.details).toBe(details);
      expect(error.timestamp).toBeDefined();
    });
  });
});

describe('exported functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    errorHandler.clearErrorQueue();
  });

  describe('errorHandler singleton', () => {
    it('should be the same instance as ErrorHandler.getInstance()', () => {
      expect(errorHandler).toBe(ErrorHandler.getInstance());
    });
  });

  describe('handleGlobalError', () => {
    it('should handle error using singleton instance', () => {
      const error = 'Global error';
      const result = handleGlobalError(error, 'global context');

      expect(result.type).toBe(ErrorType.BUSINESS_ERROR);
      expect(result.message).toBe('Global error');
      
      const queue = errorHandler.getErrorQueue();
      expect(queue).toHaveLength(1);
    });
  });
});

describe('ErrorType enum', () => {
  it('should have all expected error types', () => {
    expect(ErrorType.NETWORK_ERROR).toBe('NETWORK_ERROR');
    expect(ErrorType.API_ERROR).toBe('API_ERROR');
    expect(ErrorType.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
    expect(ErrorType.AUTH_ERROR).toBe('AUTH_ERROR');
    expect(ErrorType.BUSINESS_ERROR).toBe('BUSINESS_ERROR');
    expect(ErrorType.UNKNOWN_ERROR).toBe('UNKNOWN_ERROR');
  });
});