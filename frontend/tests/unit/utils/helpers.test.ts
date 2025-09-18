import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatUtils,
  timeUtils,
  validationUtils,
  storageUtils,
  domUtils,
  arrayUtils,
  objectUtils,
  throttleUtils,
  randomUtils
} from '../../../src/utils/helpers';

// Mock localStorage and sessionStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
});

// Mock navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn(),
  },
});

// Mock document.execCommand
Object.defineProperty(document, 'execCommand', {
  value: vi.fn(),
});

describe('formatUtils', () => {
  describe('formatPrice', () => {
    it('should format price with default currency', () => {
      expect(formatUtils.formatPrice(99.9)).toBe('¥99.90');
    });

    it('should format price with custom currency', () => {
      expect(formatUtils.formatPrice(99.9, '$')).toBe('$99.90');
    });

    it('should handle integer prices', () => {
      expect(formatUtils.formatPrice(100)).toBe('¥100.00');
    });
  });

  describe('formatNumber', () => {
    it('should add thousand separators', () => {
      expect(formatUtils.formatNumber(1234567)).toBe('1,234,567');
    });

    it('should handle small numbers', () => {
      expect(formatUtils.formatNumber(123)).toBe('123');
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(formatUtils.formatFileSize(0)).toBe('0 Bytes');
      expect(formatUtils.formatFileSize(1024)).toBe('1 KB');
      expect(formatUtils.formatFileSize(1048576)).toBe('1 MB');
    });
  });

  describe('formatPhone', () => {
    it('should format valid phone number', () => {
      expect(formatUtils.formatPhone('13812345678')).toBe('138 1234 5678');
    });

    it('should return original for invalid phone', () => {
      expect(formatUtils.formatPhone('123')).toBe('123');
    });
  });

  describe('truncateText', () => {
    it('should truncate long text', () => {
      expect(formatUtils.truncateText('Hello World', 5)).toBe('He...');
    });

    it('should return original for short text', () => {
      expect(formatUtils.truncateText('Hi', 5)).toBe('Hi');
    });

    it('should use custom suffix', () => {
      expect(formatUtils.truncateText('Hello World', 5, '---')).toBe('He---');
    });
  });
});

describe('timeUtils', () => {
  describe('formatTime', () => {
    it('should format timestamp with default format', () => {
      const date = new Date('2023-12-25 10:30:45');
      const result = timeUtils.formatTime(date.getTime());
      expect(result).toBe('2023-12-25 10:30:45');
    });

    it('should format with custom format', () => {
      const date = new Date('2023-12-25 10:30:45');
      const result = timeUtils.formatTime(date.getTime(), 'YYYY/MM/DD');
      expect(result).toBe('2023/12/25');
    });
  });

  describe('getRelativeTime', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2023-12-25 12:00:00'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return "刚刚" for recent time', () => {
      const recent = new Date('2023-12-25 11:59:30').getTime();
      expect(timeUtils.getRelativeTime(recent)).toBe('刚刚');
    });

    it('should return minutes ago', () => {
      const fiveMinutesAgo = new Date('2023-12-25 11:55:00').getTime();
      expect(timeUtils.getRelativeTime(fiveMinutesAgo)).toBe('5分钟前');
    });

    it('should return hours ago', () => {
      const twoHoursAgo = new Date('2023-12-25 10:00:00').getTime();
      expect(timeUtils.getRelativeTime(twoHoursAgo)).toBe('2小时前');
    });
  });

  describe('isToday', () => {
    it('should return true for today', () => {
      const today = new Date();
      expect(timeUtils.isToday(today)).toBe(true);
    });

    it('should return false for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(timeUtils.isToday(yesterday)).toBe(false);
    });
  });

  describe('getTimestamp', () => {
    it('should return current timestamp', () => {
      const before = Date.now();
      const timestamp = timeUtils.getTimestamp();
      const after = Date.now();
      expect(timestamp).toBeGreaterThanOrEqual(before);
      expect(timestamp).toBeLessThanOrEqual(after);
    });
  });
});

describe('validationUtils', () => {
  describe('isValidEmail', () => {
    it('should validate correct email', () => {
      expect(validationUtils.isValidEmail('test@example.com')).toBe(true);
    });

    it('should reject invalid email', () => {
      expect(validationUtils.isValidEmail('invalid-email')).toBe(false);
      expect(validationUtils.isValidEmail('test@')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should validate correct phone', () => {
      expect(validationUtils.isValidPhone('13812345678')).toBe(true);
    });

    it('should reject invalid phone', () => {
      expect(validationUtils.isValidPhone('12345678901')).toBe(false);
      expect(validationUtils.isValidPhone('1381234567')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong password', () => {
      const result = validationUtils.validatePassword('abc123');
      expect(result.isValid).toBe(true);
    });

    it('should reject short password', () => {
      const result = validationUtils.validatePassword('abc');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('密码长度至少6位');
    });

    it('should reject password without letters', () => {
      const result = validationUtils.validatePassword('123456');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('密码必须包含字母');
    });

    it('should reject password without numbers', () => {
      const result = validationUtils.validatePassword('abcdef');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('密码必须包含数字');
    });
  });

  describe('isValidUrl', () => {
    it('should validate correct URL', () => {
      expect(validationUtils.isValidUrl('https://example.com')).toBe(true);
    });

    it('should reject invalid URL', () => {
      expect(validationUtils.isValidUrl('not-a-url')).toBe(false);
    });
  });
});

describe('storageUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('localStorage operations', () => {
    it('should set localStorage', () => {
      storageUtils.setLocal('test', { value: 'data' });
      expect(localStorageMock.setItem).toHaveBeenCalledWith('test', '{"value":"data"}');
    });

    it('should get localStorage', () => {
      localStorageMock.getItem.mockReturnValue('{"value":"data"}');
      const result = storageUtils.getLocal('test');
      expect(result).toEqual({ value: 'data' });
    });

    it('should return default value when item not found', () => {
      localStorageMock.getItem.mockReturnValue(null);
      const result = storageUtils.getLocal('test', 'default');
      expect(result).toBe('default');
    });

    it('should remove localStorage', () => {
      storageUtils.removeLocal('test');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('test');
    });
  });

  describe('sessionStorage operations', () => {
    it('should set sessionStorage', () => {
      storageUtils.setSession('test', { value: 'data' });
      expect(sessionStorageMock.setItem).toHaveBeenCalledWith('test', '{"value":"data"}');
    });

    it('should get sessionStorage', () => {
      sessionStorageMock.getItem.mockReturnValue('{"value":"data"}');
      const result = storageUtils.getSession('test');
      expect(result).toEqual({ value: 'data' });
    });
  });
});

describe('arrayUtils', () => {
  describe('unique', () => {
    it('should remove duplicates', () => {
      expect(arrayUtils.unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
    });
  });

  describe('groupBy', () => {
    it('should group by key', () => {
      const data = [
        { category: 'A', value: 1 },
        { category: 'B', value: 2 },
        { category: 'A', value: 3 }
      ];
      const result = arrayUtils.groupBy(data, 'category');
      expect(result.A).toHaveLength(2);
      expect(result.B).toHaveLength(1);
    });
  });

  describe('sortBy', () => {
    it('should sort ascending by default', () => {
      const data = [{ value: 3 }, { value: 1 }, { value: 2 }];
      const result = arrayUtils.sortBy(data, 'value');
      expect(result.map(item => item.value)).toEqual([1, 2, 3]);
    });

    it('should sort descending', () => {
      const data = [{ value: 1 }, { value: 3 }, { value: 2 }];
      const result = arrayUtils.sortBy(data, 'value', 'desc');
      expect(result.map(item => item.value)).toEqual([3, 2, 1]);
    });
  });

  describe('paginate', () => {
    it('should paginate array', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const result = arrayUtils.paginate(data, 2, 3);
      expect(result).toEqual([4, 5, 6]);
    });
  });
});

describe('objectUtils', () => {
  describe('deepClone', () => {
    it('should deep clone object', () => {
      const original = { a: 1, b: { c: 2 } };
      const cloned = objectUtils.deepClone(original);
      cloned.b.c = 3;
      expect(original.b.c).toBe(2);
    });

    it('should clone arrays', () => {
      const original = [1, [2, 3]];
      const cloned = objectUtils.deepClone(original);
      cloned[1][0] = 4;
      expect(original[1][0]).toBe(2);
    });
  });

  describe('get', () => {
    it('should get nested property', () => {
      const obj = { a: { b: { c: 'value' } } };
      expect(objectUtils.get(obj, 'a.b.c')).toBe('value');
    });

    it('should return default for missing property', () => {
      const obj = { a: 1 };
      expect(objectUtils.get(obj, 'a.b.c', 'default')).toBe('default');
    });
  });

  describe('isEmpty', () => {
    it('should detect empty objects', () => {
      expect(objectUtils.isEmpty({})).toBe(true);
      expect(objectUtils.isEmpty([])).toBe(true);
      expect(objectUtils.isEmpty('')).toBe(true);
      expect(objectUtils.isEmpty(null)).toBe(true);
    });

    it('should detect non-empty objects', () => {
      expect(objectUtils.isEmpty({ a: 1 })).toBe(false);
      expect(objectUtils.isEmpty([1])).toBe(false);
      expect(objectUtils.isEmpty('text')).toBe(false);
    });
  });
});

describe('throttleUtils', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('debounce', () => {
    it('should debounce function calls', () => {
      const fn = vi.fn();
      const debouncedFn = throttleUtils.debounce(fn, 100);
      
      debouncedFn();
      debouncedFn();
      debouncedFn();
      
      expect(fn).not.toHaveBeenCalled();
      
      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('throttle', () => {
    it('should throttle function calls', () => {
      const fn = vi.fn();
      const throttledFn = throttleUtils.throttle(fn, 100);
      
      throttledFn();
      throttledFn();
      throttledFn();
      
      expect(fn).toHaveBeenCalledTimes(1);
      
      vi.advanceTimersByTime(100);
      throttledFn();
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });
});

describe('randomUtils', () => {
  describe('generateId', () => {
    it('should generate id with default length', () => {
      const id = randomUtils.generateId();
      expect(id).toHaveLength(8);
    });

    it('should generate id with custom length', () => {
      const id = randomUtils.generateId(12);
      expect(id).toHaveLength(12);
    });
  });

  describe('randomNumber', () => {
    it('should generate number in range', () => {
      const num = randomUtils.randomNumber(1, 10);
      expect(num).toBeGreaterThanOrEqual(1);
      expect(num).toBeLessThanOrEqual(10);
    });
  });

  describe('randomChoice', () => {
    it('should choose from array', () => {
      const array = ['a', 'b', 'c'];
      const choice = randomUtils.randomChoice(array);
      expect(array).toContain(choice);
    });
  });
});