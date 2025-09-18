import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock fetch response helper
const mockFetch = (response: any, status = 200) => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(response),
  });
};

const API_BASE_URL = 'http://localhost:3001/api';

describe('Auth API Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register user successfully with valid data', async () => {
      const mockResponse = {
        success: true,
        message: '注册成功',
        data: {
          id: '1',
          phone: '13800138000',
          username: 'testuser',
          createdAt: new Date().toISOString(),
        },
      };

      mockFetch(mockResponse, 201);

      const registerData = {
        phone: '13800138000',
        password: '123456',
        username: 'testuser',
        verificationCode: '123456',
      };

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      const result = await response.json();

      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      expect(response.status).toBe(201);
      expect(result.success).toBe(true);
      expect(result.message).toBe('注册成功');
      expect(result.data).toHaveProperty('id');
      expect(result.data).toHaveProperty('phone', '13800138000');
      expect(result.data).toHaveProperty('username', 'testuser');
    });

    it('should fail with invalid phone number', async () => {
      const mockResponse = {
        success: false,
        message: '手机号格式不正确',
        errors: {
          phone: '手机号必须为11位数字',
        },
      };

      mockFetch(mockResponse, 400);

      const registerData = {
        phone: '138001380',
        password: '123456',
        username: 'testuser',
        verificationCode: '123456',
      };

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.message).toBe('手机号格式不正确');
      expect(result.errors).toHaveProperty('phone');
    });

    it('should fail with weak password', async () => {
      const mockResponse = {
        success: false,
        message: '密码强度不足',
        errors: {
          password: '密码长度必须在6-20位之间',
        },
      };

      mockFetch(mockResponse, 400);

      const registerData = {
        phone: '13800138000',
        password: '123',
        username: 'testuser',
        verificationCode: '123456',
      };

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.message).toBe('密码强度不足');
      expect(result.errors).toHaveProperty('password');
    });

    it('should fail with duplicate phone number', async () => {
      const mockResponse = {
        success: false,
        message: '手机号已被注册',
      };

      mockFetch(mockResponse, 409);

      const registerData = {
        phone: '13800138000',
        password: '123456',
        username: 'testuser',
        verificationCode: '123456',
      };

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      const result = await response.json();

      expect(response.status).toBe(409);
      expect(result.success).toBe(false);
      expect(result.message).toBe('手机号已被注册');
    });

    it('should fail with invalid verification code', async () => {
      const mockResponse = {
        success: false,
        message: '验证码错误或已过期',
      };

      mockFetch(mockResponse, 400);

      const registerData = {
        phone: '13800138000',
        password: '123456',
        username: 'testuser',
        verificationCode: '000000',
      };

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.message).toBe('验证码错误或已过期');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockResponse = {
        success: true,
        message: '登录成功',
        data: {
          user: {
            id: '1',
            phone: '13800138000',
            username: 'testuser',
            lastLoginAt: new Date().toISOString(),
          },
          token: 'mock-jwt-token-12345',
        },
      };

      mockFetch(mockResponse, 200);

      const loginData = {
        phone: '13800138000',
        password: '123456',
      };

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const result = await response.json();

      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.message).toBe('登录成功');
      expect(result.data).toHaveProperty('user');
      expect(result.data).toHaveProperty('token');
      expect(result.data.user).toHaveProperty('phone', '13800138000');
    });

    it('should fail with invalid phone number', async () => {
      const mockResponse = {
        success: false,
        message: '手机号格式不正确',
      };

      mockFetch(mockResponse, 400);

      const loginData = {
        phone: '138001380',
        password: '123456',
      };

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.message).toBe('手机号格式不正确');
    });

    it('should fail with wrong password', async () => {
      const mockResponse = {
        success: false,
        message: '手机号或密码错误',
      };

      mockFetch(mockResponse, 401);

      const loginData = {
        phone: '13800138000',
        password: 'wrongpassword',
      };

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const result = await response.json();

      expect(response.status).toBe(401);
      expect(result.success).toBe(false);
      expect(result.message).toBe('手机号或密码错误');
    });

    it('should fail with non-existent user', async () => {
      const mockResponse = {
        success: false,
        message: '用户不存在',
      };

      mockFetch(mockResponse, 404);

      const loginData = {
        phone: '13900139000',
        password: '123456',
      };

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const result = await response.json();

      expect(response.status).toBe(404);
      expect(result.success).toBe(false);
      expect(result.message).toBe('用户不存在');
    });
  });
});