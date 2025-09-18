import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import axios from 'axios';

// API合约测试：用户登出接口
// 测试 POST /api/auth/logout 接口
// 验证认证头和响应格式

const API_BASE_URL = 'http://localhost:3001';
const LOGIN_ENDPOINT = '/api/auth/login';
const LOGOUT_ENDPOINT = '/api/auth/logout';
const REGISTER_ENDPOINT = '/api/auth/register';

describe('用户登出API合约测试', () => {
  let testUserId: string;
  let authToken: string;
  let refreshToken: string;
  
  const testUser = {
    phone: '13800138200',
    password: 'Test123456'
  };

  beforeAll(async () => {
    // 创建测试用户并登录
    try {
      // 注册测试用户
      const registerData = {
        phone: testUser.phone,
        password: testUser.password,
        verificationCode: '123456'
      };
      
      const registerResponse = await axios.post(`${API_BASE_URL}${REGISTER_ENDPOINT}`, registerData);
      testUserId = registerResponse.data.data.userId;
      
      // 登录获取token
      const loginData = {
        phone: testUser.phone,
        password: testUser.password
      };
      
      const loginResponse = await axios.post(`${API_BASE_URL}${LOGIN_ENDPOINT}`, loginData);
      authToken = loginResponse.data.data.token;
      refreshToken = loginResponse.data.data.refreshToken;
      
      console.log('测试用户创建并登录成功:', testUserId);
    } catch (error) {
      console.log('创建测试用户或登录失败:', error);
    }
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

  describe('正常登出流程', () => {
    it('应该成功登出用户', async () => {
      const response = await axios.post(
        `${API_BASE_URL}${LOGOUT_ENDPOINT}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      // 验证响应状态码
      expect(response.status).toBe(200);

      // 验证响应数据结构
      expect(response.data).toHaveProperty('code', 200);
      expect(response.data).toHaveProperty('message');
      expect(response.data.message).toContain('登出成功');
      
      // 验证响应数据
      expect(response.data).toHaveProperty('data');
      expect(response.data.data).toHaveProperty('logoutTime');
      expect(typeof response.data.data.logoutTime).toBe('string');
    });

    it('应该支持使用refresh token登出', async () => {
      // 重新登录获取新token
      const loginData = {
        phone: testUser.phone,
        password: testUser.password,
        loginType: 'password'
      };
      
      const loginResponse = await axios.post(`${API_BASE_URL}${LOGIN_ENDPOINT}`, loginData);
      const newToken = loginResponse.data.data.token;
      const newRefreshToken = loginResponse.data.data.refreshToken;

      const response = await axios.post(
        `${API_BASE_URL}${LOGOUT_ENDPOINT}`,
        {
          refreshToken: newRefreshToken
        },
        {
          headers: {
            'Authorization': `Bearer ${newToken}`
          }
        }
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('success', true);
    });

    it('应该支持全设备登出', async () => {
      // 重新登录获取新token
      const loginData = {
        phone: testUser.phone,
        password: testUser.password,
        loginType: 'password'
      };
      
      const loginResponse = await axios.post(`${API_BASE_URL}${LOGIN_ENDPOINT}`, loginData);
      const newToken = loginResponse.data.data.token;

      const response = await axios.post(
        `${API_BASE_URL}${LOGOUT_ENDPOINT}`,
        {
          logoutAll: true
        },
        {
          headers: {
            'Authorization': `Bearer ${newToken}`
          }
        }
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('success', true);
      expect(response.data.data).toHaveProperty('affectedSessions');
      expect(typeof response.data.data.affectedSessions).toBe('number');
    });
  });

  describe('认证验证', () => {
    it('应该拒绝无效的Authorization头', async () => {
      try {
        await axios.post(
          `${API_BASE_URL}${LOGOUT_ENDPOINT}`,
          {},
          {
            headers: {
              'Authorization': 'Bearer invalid_token'
            }
          }
        );
        expect.fail('应该抛出错误');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
        expect(error.response.data).toHaveProperty('code', 401);
        expect(error.response.data.message).toContain('无效的token');
      }
    });

    it('应该拒绝缺少Authorization头的请求', async () => {
      try {
        await axios.post(`${API_BASE_URL}${LOGOUT_ENDPOINT}`, {});
        expect.fail('应该抛出错误');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
        expect(error.response.data).toHaveProperty('code', 401);
        expect(error.response.data.message).toContain('缺少认证信息');
      }
    });

    it('应该拒绝格式错误的Authorization头', async () => {
      try {
        await axios.post(
          `${API_BASE_URL}${LOGOUT_ENDPOINT}`,
          {},
          {
            headers: {
              'Authorization': 'InvalidFormat token123'
            }
          }
        );
        expect.fail('应该抛出错误');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
        expect(error.response.data).toHaveProperty('code', 401);
        expect(error.response.data.message).toContain('认证格式错误');
      }
    });

    it('应该拒绝已过期的token', async () => {
      // 模拟过期token
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid';
      
      try {
        await axios.post(
          `${API_BASE_URL}${LOGOUT_ENDPOINT}`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${expiredToken}`
            }
          }
        );
        expect.fail('应该抛出错误');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
        expect(error.response.data).toHaveProperty('code', 401);
        expect(error.response.data.message).toContain('token已过期');
      }
    });
  });

  describe('幂等性验证', () => {
    it('重复登出应该返回成功状态', async () => {
      // 重新登录获取新token
      const loginData = {
        phone: testUser.phone,
        password: testUser.password,
        loginType: 'password'
      };
      
      const loginResponse = await axios.post(`${API_BASE_URL}${LOGIN_ENDPOINT}`, loginData);
      const newToken = loginResponse.data.data.token;

      // 第一次登出
      const firstLogout = await axios.post(
        `${API_BASE_URL}${LOGOUT_ENDPOINT}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${newToken}`
          }
        }
      );

      expect(firstLogout.status).toBe(200);

      // 第二次登出（使用相同token）
      try {
        await axios.post(
          `${API_BASE_URL}${LOGOUT_ENDPOINT}`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${newToken}`
            }
          }
        );
        expect.fail('应该抛出错误');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
        expect(error.response.data.message).toContain('token已失效');
      }
    });
  });

  describe('响应头验证', () => {
    it('应该返回正确的Content-Type', async () => {
      // 重新登录获取新token
      const loginData = {
        phone: testUser.phone,
        password: testUser.password,
        loginType: 'password'
      };
      
      const loginResponse = await axios.post(`${API_BASE_URL}${LOGIN_ENDPOINT}`, loginData);
      const newToken = loginResponse.data.data.token;

      const response = await axios.post(
        `${API_BASE_URL}${LOGOUT_ENDPOINT}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${newToken}`
          }
        }
      );
      
      expect(response.headers['content-type']).toContain('application/json');
    });

    it('应该包含安全相关的响应头', async () => {
      // 重新登录获取新token
      const loginData = {
        phone: testUser.phone,
        password: testUser.password,
        loginType: 'password'
      };
      
      const loginResponse = await axios.post(`${API_BASE_URL}${LOGIN_ENDPOINT}`, loginData);
      const newToken = loginResponse.data.data.token;

      const response = await axios.post(
        `${API_BASE_URL}${LOGOUT_ENDPOINT}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${newToken}`
          }
        }
      );
      
      // 检查安全相关的响应头
      expect(response.headers).toHaveProperty('x-ratelimit-limit');
      expect(response.headers).toHaveProperty('x-ratelimit-remaining');
    });
  });

  describe('Token失效验证', () => {
    it('登出后token应该立即失效', async () => {
      // 重新登录获取新token
      const loginData = {
        phone: testUser.phone,
        password: testUser.password,
        loginType: 'password'
      };
      
      const loginResponse = await axios.post(`${API_BASE_URL}${LOGIN_ENDPOINT}`, loginData);
      const newToken = loginResponse.data.data.token;

      // 登出
      await axios.post(
        `${API_BASE_URL}${LOGOUT_ENDPOINT}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${newToken}`
          }
        }
      );

      // 尝试使用已登出的token访问需要认证的API
      try {
        await axios.get(`${API_BASE_URL}/api/user/profile`, {
          headers: {
            'Authorization': `Bearer ${newToken}`
          }
        });
        expect.fail('应该抛出错误');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
        expect(error.response.data.message).toContain('token已失效');
      }
    });
  });
});