import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  Logger,
  LogLevel,
  LogEntry,
  logger,
  log
} from '../../../src/utils/logger';

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
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  log: vi.fn(),
};

Object.defineProperty(console, 'debug', { value: consoleMock.debug });
Object.defineProperty(console, 'info', { value: consoleMock.info });
Object.defineProperty(console, 'warn', { value: consoleMock.warn });
Object.defineProperty(console, 'error', { value: consoleMock.error });
Object.defineProperty(console, 'log', { value: consoleMock.log });

// Mock Date.now for consistent timestamps
const mockTimestamp = 1640995200000; // 2022-01-01 00:00:00
vi.spyOn(Date, 'now').mockReturnValue(mockTimestamp);

// Mock Math.random for consistent session IDs
vi.spyOn(Math, 'random').mockReturnValue(0.123456789);

// Mock process.env
const originalEnv = process.env.NODE_ENV;

describe('Logger', () => {
  let loggerInstance: Logger;

  beforeEach(() => {
    loggerInstance = Logger.getInstance();
    vi.clearAllMocks();
    loggerInstance.clearLogs();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = Logger.getInstance();
      const instance2 = Logger.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('log levels in different environments', () => {
    it('should set DEBUG level in development', () => {
      process.env.NODE_ENV = 'development';
      const devLogger = new (Logger as any)();
      expect(devLogger.getLevel()).toBe(LogLevel.DEBUG);
    });

    it('should set WARN level in production', () => {
      process.env.NODE_ENV = 'production';
      const prodLogger = new (Logger as any)();
      expect(prodLogger.getLevel()).toBe(LogLevel.WARN);
    });

    it('should set INFO level in other environments', () => {
      process.env.NODE_ENV = 'test';
      const testLogger = new (Logger as any)();
      expect(testLogger.getLevel()).toBe(LogLevel.INFO);
    });
  });

  describe('logging methods', () => {
    beforeEach(() => {
      loggerInstance.setLevel(LogLevel.DEBUG);
    });

    it('should log debug message', () => {
      loggerInstance.debug('Debug message', { data: 'test' }, 'TEST');

      const logs = loggerInstance.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe(LogLevel.DEBUG);
      expect(logs[0].message).toBe('Debug message');
      expect(logs[0].data).toEqual({ data: 'test' });
      expect(logs[0].context).toBe('TEST');
      expect(logs[0].timestamp).toBe(mockTimestamp);
    });

    it('should log info message', () => {
      loggerInstance.info('Info message');

      const logs = loggerInstance.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe(LogLevel.INFO);
      expect(logs[0].message).toBe('Info message');
    });

    it('should log warn message', () => {
      loggerInstance.warn('Warning message');

      const logs = loggerInstance.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe(LogLevel.WARN);
      expect(logs[0].message).toBe('Warning message');
    });

    it('should log error message', () => {
      loggerInstance.error('Error message');

      const logs = loggerInstance.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe(LogLevel.ERROR);
      expect(logs[0].message).toBe('Error message');
    });
  });

  describe('log level filtering', () => {
    it('should filter logs based on level', () => {
      loggerInstance.setLevel(LogLevel.WARN);
      
      loggerInstance.debug('Debug message');
      loggerInstance.info('Info message');
      loggerInstance.warn('Warning message');
      loggerInstance.error('Error message');

      const logs = loggerInstance.getLogs();
      expect(logs).toHaveLength(2); // Only WARN and ERROR
      expect(logs[0].level).toBe(LogLevel.WARN);
      expect(logs[1].level).toBe(LogLevel.ERROR);
    });
  });

  describe('console output', () => {
    beforeEach(() => {
      loggerInstance.setLevel(LogLevel.DEBUG);
    });

    it('should output debug to console.debug', () => {
      loggerInstance.debug('Debug message', { data: 'test' });
      
      expect(consoleMock.debug).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG] Debug message'),
        { data: 'test' }
      );
    });

    it('should output info to console.info', () => {
      loggerInstance.info('Info message');
      
      expect(consoleMock.info).toHaveBeenCalledWith(
        expect.stringContaining('[INFO] Info message'),
        undefined
      );
    });

    it('should output warn to console.warn', () => {
      loggerInstance.warn('Warning message');
      
      expect(consoleMock.warn).toHaveBeenCalledWith(
        expect.stringContaining('[WARN] Warning message'),
        undefined
      );
    });

    it('should output error to console.error', () => {
      loggerInstance.error('Error message');
      
      expect(consoleMock.error).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR] Error message'),
        undefined
      );
    });

    it('should include context in console output', () => {
      loggerInstance.info('Test message', null, 'TEST_CONTEXT');
      
      expect(consoleMock.info).toHaveBeenCalledWith(
        expect.stringContaining('[TEST_CONTEXT] Test message'),
        null
      );
    });
  });

  describe('server logging in production', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
      loggerInstance.setLevel(LogLevel.DEBUG);
    });

    it('should send warn logs to server in production', () => {
      loggerInstance.warn('Warning message');
      
      expect(consoleMock.log).toHaveBeenCalledWith(
        'Log sent to server:',
        expect.objectContaining({
          level: LogLevel.WARN,
          message: 'Warning message'
        })
      );
    });

    it('should send error logs to server in production', () => {
      loggerInstance.error('Error message');
      
      expect(consoleMock.log).toHaveBeenCalledWith(
        'Log sent to server:',
        expect.objectContaining({
          level: LogLevel.ERROR,
          message: 'Error message'
        })
      );
    });

    it('should not send debug/info logs to server in production', () => {
      loggerInstance.debug('Debug message');
      loggerInstance.info('Info message');
      
      expect(consoleMock.log).not.toHaveBeenCalledWith(
        'Log sent to server:',
        expect.anything()
      );
    });
  });

  describe('user ID handling', () => {
    it('should include user ID from localStorage', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ id: 'user123' }));
      
      loggerInstance.info('Test message');
      
      const logs = loggerInstance.getLogs();
      expect(logs[0].userId).toBe('user123');
    });

    it('should handle invalid JSON in localStorage', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');
      
      loggerInstance.info('Test message');
      
      const logs = loggerInstance.getLogs();
      expect(logs[0].userId).toBeUndefined();
    });

    it('should handle null user in localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      loggerInstance.info('Test message');
      
      const logs = loggerInstance.getLogs();
      expect(logs[0].userId).toBeUndefined();
    });
  });

  describe('log management', () => {
    it('should limit log array size', () => {
      loggerInstance.setLevel(LogLevel.DEBUG);
      
      // Add more than maxLogSize logs
      for (let i = 0; i < 1005; i++) {
        loggerInstance.info(`Message ${i}`);
      }
      
      const logs = loggerInstance.getLogs();
      expect(logs.length).toBeLessThanOrEqual(1000);
    });

    it('should get logs by level', () => {
      loggerInstance.setLevel(LogLevel.DEBUG);
      
      loggerInstance.debug('Debug message');
      loggerInstance.info('Info message');
      loggerInstance.warn('Warning message');
      loggerInstance.error('Error message');
      
      const warnAndErrorLogs = loggerInstance.getLogs(LogLevel.WARN);
      expect(warnAndErrorLogs).toHaveLength(2);
      expect(warnAndErrorLogs[0].level).toBe(LogLevel.WARN);
      expect(warnAndErrorLogs[1].level).toBe(LogLevel.ERROR);
    });

    it('should clear logs', () => {
      loggerInstance.info('Test message');
      expect(loggerInstance.getLogs()).toHaveLength(1);
      
      loggerInstance.clearLogs();
      expect(loggerInstance.getLogs()).toHaveLength(0);
    });

    it('should export logs as JSON', () => {
      loggerInstance.info('Test message');
      
      const exported = loggerInstance.exportLogs();
      const parsed = JSON.parse(exported);
      
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].message).toBe('Test message');
    });
  });

  describe('specialized logging methods', () => {
    beforeEach(() => {
      loggerInstance.setLevel(LogLevel.DEBUG);
    });

    it('should log API request', () => {
      loggerInstance.logApiRequest('GET', '/api/users', { param: 'value' });
      
      const logs = loggerInstance.getLogs();
      expect(logs[0].message).toBe('API Request: GET /api/users');
      expect(logs[0].context).toBe('API');
      expect(logs[0].data).toEqual({ param: 'value' });
    });

    it('should log successful API response', () => {
      loggerInstance.logApiResponse('GET', '/api/users', 200, { users: [] });
      
      const logs = loggerInstance.getLogs();
      expect(logs[0].message).toBe('API Response: GET /api/users - 200');
      expect(logs[0].level).toBe(LogLevel.DEBUG);
      expect(logs[0].context).toBe('API');
    });

    it('should log error API response', () => {
      loggerInstance.logApiResponse('POST', '/api/users', 400, { error: 'Bad Request' });
      
      const logs = loggerInstance.getLogs();
      expect(logs[0].message).toBe('API Response: POST /api/users - 400');
      expect(logs[0].level).toBe(LogLevel.ERROR);
      expect(logs[0].context).toBe('API');
    });

    it('should log user action', () => {
      loggerInstance.logUserAction('click_button', { buttonId: 'submit' });
      
      const logs = loggerInstance.getLogs();
      expect(logs[0].message).toBe('User Action: click_button');
      expect(logs[0].context).toBe('USER');
      expect(logs[0].data).toEqual({ buttonId: 'submit' });
    });

    it('should log page view', () => {
      loggerInstance.logPageView('/dashboard', { referrer: '/home' });
      
      const logs = loggerInstance.getLogs();
      expect(logs[0].message).toBe('Page View: /dashboard');
      expect(logs[0].context).toBe('NAVIGATION');
      expect(logs[0].data).toEqual({ referrer: '/home' });
    });

    it('should log performance metric', () => {
      loggerInstance.logPerformance('page_load_time', 1500, 'ms');
      
      const logs = loggerInstance.getLogs();
      expect(logs[0].message).toBe('Performance: page_load_time = 1500ms');
      expect(logs[0].context).toBe('PERFORMANCE');
      expect(logs[0].data).toEqual({ metric: 'page_load_time', value: 1500, unit: 'ms' });
    });

    it('should log performance metric with default unit', () => {
      loggerInstance.logPerformance('api_response_time', 250);
      
      const logs = loggerInstance.getLogs();
      expect(logs[0].message).toBe('Performance: api_response_time = 250ms');
      expect(logs[0].data).toEqual({ metric: 'api_response_time', value: 250, unit: 'ms' });
    });
  });

  describe('level management', () => {
    it('should set and get log level', () => {
      loggerInstance.setLevel(LogLevel.ERROR);
      expect(loggerInstance.getLevel()).toBe(LogLevel.ERROR);
    });
  });
});

describe('exported instances and functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    logger.clearLogs();
    logger.setLevel(LogLevel.DEBUG);
  });

  describe('logger singleton', () => {
    it('should be the same instance as Logger.getInstance()', () => {
      expect(logger).toBe(Logger.getInstance());
    });
  });

  describe('log convenience functions', () => {
    it('should call logger.debug', () => {
      log.debug('Debug message', { data: 'test' }, 'TEST');
      
      const logs = logger.getLogs();
      expect(logs[0].message).toBe('Debug message');
      expect(logs[0].level).toBe(LogLevel.DEBUG);
    });

    it('should call logger.info', () => {
      log.info('Info message');
      
      const logs = logger.getLogs();
      expect(logs[0].message).toBe('Info message');
      expect(logs[0].level).toBe(LogLevel.INFO);
    });

    it('should call logger.warn', () => {
      log.warn('Warning message');
      
      const logs = logger.getLogs();
      expect(logs[0].message).toBe('Warning message');
      expect(logs[0].level).toBe(LogLevel.WARN);
    });

    it('should call logger.error', () => {
      log.error('Error message');
      
      const logs = logger.getLogs();
      expect(logs[0].message).toBe('Error message');
      expect(logs[0].level).toBe(LogLevel.ERROR);
    });

    it('should call specialized logging methods', () => {
      log.apiRequest('GET', '/api/test');
      log.apiResponse('GET', '/api/test', 200);
      log.userAction('test_action');
      log.pageView('/test');
      log.performance('test_metric', 100);
      
      const logs = logger.getLogs();
      expect(logs).toHaveLength(5);
    });
  });
});

describe('LogLevel enum', () => {
  it('should have correct numeric values', () => {
    expect(LogLevel.DEBUG).toBe(0);
    expect(LogLevel.INFO).toBe(1);
    expect(LogLevel.WARN).toBe(2);
    expect(LogLevel.ERROR).toBe(3);
  });
});