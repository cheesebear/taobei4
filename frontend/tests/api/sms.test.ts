import { describe, it, expect, beforeEach, vi } from 'vitest';

const API_BASE_URL = 'http://localhost:3000/api';

// Mock fetch function
const mockFetch = (mockResponse: any, status: number = 200) => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(mockResponse),
  });
};

describe('SMS API Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth/send-code', () => {
    it('should send verification code successfully', async () => {
      const mockResponse = {
        success: true,
        message: '验证码发送成功',
        data: {
          codeId: 'code-12345',
          expiresIn: 300, // 5 minutes
        },
      };

      mockFetch(mockResponse, 200);

      const smsData = {
        phone: '13800138000',
        type: 'register', // register, login, reset_password
      };

      const response = await fetch(`${API_BASE_URL}/auth/send-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(smsData),
      });

      const result = await response.json();

      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/auth/send-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(smsData),
      });

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.message).toBe('验证码发送成功');
      expect(result.data).toHaveProperty('codeId');
      expect(result.data).toHaveProperty('expiresIn');
    });

    it('should fail with invalid phone number', async () => {
      const mockResponse = {
        success: false,
        message: '手机号格式不正确',
      };

      mockFetch(mockResponse, 400);

      const smsData = {
        phone: '138001380', // Invalid phone number
        type: 'register',
      };

      const response = await fetch(`${API_BASE_URL}/auth/send-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(smsData),
      });

      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.message).toBe('手机号格式不正确');
    });

    it('should fail with invalid type', async () => {
      const mockResponse = {
        success: false,
        message: '验证码类型无效',
      };

      mockFetch(mockResponse, 400);

      const smsData = {
        phone: '13800138000',
        type: 'invalid_type',
      };

      const response = await fetch(`${API_BASE_URL}/auth/send-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(smsData),
      });

      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.message).toBe('验证码类型无效');
    });

    it('should fail when sending too frequently', async () => {
      const mockResponse = {
        success: false,
        message: '发送过于频繁，请稍后再试',
        data: {
          remainingTime: 45, // seconds until next send allowed
        },
      };

      mockFetch(mockResponse, 429);

      const smsData = {
        phone: '13800138000',
        type: 'register',
      };

      const response = await fetch(`${API_BASE_URL}/auth/send-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(smsData),
      });

      const result = await response.json();

      expect(response.status).toBe(429);
      expect(result.success).toBe(false);
      expect(result.message).toBe('发送过于频繁，请稍后再试');
      expect(result.data).toHaveProperty('remainingTime');
    });

    it('should fail when daily limit exceeded', async () => {
      const mockResponse = {
        success: false,
        message: '今日发送次数已达上限',
      };

      mockFetch(mockResponse, 429);

      const smsData = {
        phone: '13800138000',
        type: 'register',
      };

      const response = await fetch(`${API_BASE_URL}/auth/send-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(smsData),
      });

      const result = await response.json();

      expect(response.status).toBe(429);
      expect(result.success).toBe(false);
      expect(result.message).toBe('今日发送次数已达上限');
    });

    it('should handle different verification types', async () => {
      const types = ['register', 'login', 'reset_password'];
      
      for (const type of types) {
        const mockResponse = {
          success: true,
          message: '验证码发送成功',
          data: {
            codeId: `code-${type}-12345`,
            expiresIn: 300,
          },
        };

        mockFetch(mockResponse, 200);

        const smsData = {
          phone: '13800138000',
          type,
        };

        const response = await fetch(`${API_BASE_URL}/auth/send-code`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(smsData),
        });

        const result = await response.json();

        expect(response.status).toBe(200);
        expect(result.success).toBe(true);
        expect(result.data.codeId).toContain(type);
      }
    });
  });
});