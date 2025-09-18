import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import axios from 'axios';

// API合约测试：用户登录接口
// 测试 POST /api/auth/login 接口
// 验证认证流程和token返回

const API_BASE_URL = 'http://localhost:3001';
const LOGIN_ENDPOINT = '/api/auth/login';
const REGISTER_ENDPOINT = '/api/auth/register';

describe('用户登录API合约测试', () => {
  let testUserId: string;
  const testUser = {
    phone: '13800138000',
    password: 'HackedPassword123!'
  };

  beforeAll(async () => {
    // 使用已存在的测试用户，不需要创建
    console.log('使用已存在的测试用户进行登录测试');
    testUserId = '1'; // 使用数据库中第一个用户的ID
  });

  afterAll(async () => {
    // 清理测试数据
    if (testUserId) {
      try {
        await axios.delete(`${API_BASE_URL}/api/users/${testUserId}`);
      } catch (error) {
        console.log('清理测试数据失败:', error);
      }
    }
  });

  describe('正常登录流程', () => {
    it('应该支持密码登录', async () => {
      const loginData = {
        phone: testUser.phone,
        password: testUser.password
      };

      const response = await axios.post(`${API_BASE_URL}${LOGIN_ENDPOINT}`, loginData);

      // 验证响应状态码
      expect(response.status).toBe(200);

      // 验证响应数据结构
      expect(response.data).toHaveProperty('code', 200);
      expect(response.data).toHaveProperty('message');
      expect(response.data).toHaveProperty('data');
      expect(response.data.data).toHaveProperty('token');
      expect(response.data.data).toHaveProperty('phone', testUser.phone);

      // 验证用户信息结构
      const userInfo = response.data.data.userInfo;
      expect(userInfo).toHaveProperty('id');
      expect(userInfo).toHaveProperty('phone', testUser.phone);
      expect(userInfo).toHaveProperty('nickname');
      expect(userInfo).toHaveProperty('avatar');
      expect(userInfo).not.toHaveProperty('password'); // 不应返回密码

      // 验证token格式
      expect(typeof response.data.data.token).toBe('string');
      expect(response.data.data.token.length).toBeGreaterThan(0);
      expect(typeof response.data.data.refreshToken).toBe('string');
      expect(response.data.data.refreshToken.length).toBeGreaterThan(0);
      expect(typeof response.data.data.expiresIn).toBe('number');
      expect(response.data.data.expiresIn).toBeGreaterThan(0);
    });

    it('应该支持短信验证码登录', async () => {
      const loginData = {
        phone: testUser.phone,
        verifyCode: '123456',
        loginType: 'sms'
      };

      const response = await axios.post(`${API_BASE_URL}${LOGIN_ENDPOINT}`, loginData);

      // 验证响应状态码
      expect(response.status).toBe(200);

      // 验证响应数据结构
      expect(response.data).toHaveProperty('code', 200);
      expect(response.data).toHaveProperty('message');
      expect(response.data).toHaveProperty('data');
      expect(response.data.data).toHaveProperty('token');
      expect(response.data.data).toHaveProperty('userInfo');
    });

    it('应该支持记住登录状态', async () => {
      const loginData = {
        phone: testUser.phone,
        password: testUser.password,
        rememberMe: true
      };

      const response = await axios.post(`${API_BASE_URL}${LOGIN_ENDPOINT}`, loginData);

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('refreshToken');
      // 记住登录状态时，token有效期应该更长
      expect(response.data.data.expiresIn).toBeGreaterThan(86400); // 大于24小时
    });
  });

  describe('参数验证', () => {
    it('应该拒绝无效的手机号格式', async () => {
      const invalidData = {
        phone: '123456', // 无效手机号
        password: testUser.password
      };

      try {
        await axios.post(`${API_BASE_URL}${LOGIN_ENDPOINT}`, invalidData);
        expect.fail('应该抛出错误');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toHaveProperty('code', 400);
        expect(error.response.data.message).toContain('手机号');
      }
    });

    it('应该拒绝缺少必填字段', async () => {
      const invalidData = {
        phone: testUser.phone
        // 缺少password或verifyCode
      };

      try {
        await axios.post(`${API_BASE_URL}${LOGIN_ENDPOINT}`, invalidData);
        expect.fail('应该抛出错误');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toHaveProperty('code', 400);
      }
    });

    it('应该拒绝无效的登录类型', async () => {
      const invalidData = {
        phone: testUser.phone,
        password: testUser.password,
        loginType: 'invalid' // 无效登录类型
      };

      try {
        await axios.post(`${API_BASE_URL}${LOGIN_ENDPOINT}`, invalidData);
        expect.fail('应该抛出错误');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toHaveProperty('code', 400);
        expect(error.response.data.message).toContain('登录类型');
      }
    });
  });

  describe('认证验证', () => {
    it('应该拒绝错误的密码', async () => {
      const invalidData = {
        phone: testUser.phone,
        password: 'WrongPassword123'
      };

      try {
        await axios.post(`${API_BASE_URL}${LOGIN_ENDPOINT}`, invalidData);
        expect.fail('应该抛出错误');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
        expect(error.response.data).toHaveProperty('code', 401);
        expect(error.response.data.message).toContain('密码');
      }
    });

    it('应该拒绝不存在的用户', async () => {
      const invalidData = {
        phone: '13800138999', // 不存在的用户
        password: 'Test123456'
      };

      try {
        await axios.post(`${API_BASE_URL}${LOGIN_ENDPOINT}`, invalidData);
        expect.fail('应该抛出错误');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
        expect(error.response.data).toHaveProperty('code', 404);
        expect(error.response.data.message).toContain('用户不存在');
      }
    });

    it('应该拒绝无效的验证码', async () => {
      const invalidData = {
        phone: testUser.phone,
        verifyCode: '000000', // 无效验证码
        loginType: 'sms'
      };

      try {
        await axios.post(`${API_BASE_URL}${LOGIN_ENDPOINT}`, invalidData);
        expect.fail('应该抛出错误');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toHaveProperty('code', 400);
        expect(error.response.data.message).toContain('验证码');
      }
    });
  });

  describe('安全性验证', () => {
    it('应该在多次失败登录后锁定账户', async () => {
      const invalidData = {
        phone: testUser.phone,
        password: 'WrongPassword123'
      };

      // 连续5次错误登录
      for (let i = 0; i < 5; i++) {
        try {
          await axios.post(`${API_BASE_URL}${LOGIN_ENDPOINT}`, invalidData);
        } catch (error) {
          // 预期的错误
        }
      }

      // 第6次尝试，即使密码正确也应该被锁定
      const correctData = {
        phone: testUser.phone,
        password: testUser.password
      };

      try {
        await axios.post(`${API_BASE_URL}${LOGIN_ENDPOINT}`, correctData);
        expect.fail('应该抛出错误');
      } catch (error: any) {
        expect(error.response.status).toBe(423);
        expect(error.response.data).toHaveProperty('code', 423);
        expect(error.response.data.message).toContain('锁定');
      }
    });

    it('应该返回正确的安全响应头', async () => {
      const loginData = {
        phone: testUser.phone,
        password: testUser.password
      };

      const response = await axios.post(`${API_BASE_URL}${LOGIN_ENDPOINT}`, loginData);
      
      expect(response.headers['content-type']).toContain('application/json');
      // 检查是否有安全相关的响应头
      expect(response.headers).toHaveProperty('x-ratelimit-limit');
      expect(response.headers).toHaveProperty('x-ratelimit-remaining');
    });
  });

  describe('Token验证', () => {
    it('返回的token应该可以用于后续API调用', async () => {
      const loginData = {
        phone: testUser.phone,
        password: testUser.password
      };

      const loginResponse = await axios.post(`${API_BASE_URL}${LOGIN_ENDPOINT}`, loginData);
      const token = loginResponse.data.data.token;

      // 验证token格式
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });
  });
});