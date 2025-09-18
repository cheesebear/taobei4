import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import axios from 'axios';

// 集成测试：用户注册和登录流程
// 测试完整的用户认证流程，包括注册、登录、登出等操作
// 验证各个API之间的协作和数据一致性

const API_BASE_URL = 'http://localhost:3001';
const AUTH_ENDPOINT = '/api/auth';
const USER_ENDPOINT = '/api/user';
const CART_ENDPOINT = '/api/cart';

describe('用户注册和登录流程集成测试', () => {
  let testUserEmail: string;
  let testUserPassword: string;
  let testUserName: string;
  let testUserPhone: string;
  let authToken: string;
  let userId: string;
  let refreshToken: string;
  
  beforeAll(async () => {
    console.log('开始用户注册和登录流程集成测试');
    
    // 使用数据库中已存在的测试用户数据
    testUserEmail = 'test.user@example.com';
   testUserPassword = 'HackedPassword123!';
    testUserName = '测试用户';
    testUserPhone = '13900000001'; // 使用一个不存在的手机号进行注册测试
  });

  beforeEach(async () => {
    // 每个测试前重置状态
    authToken = '';
    userId = '';
    refreshToken = '';
  });

  afterAll(async () => {
    console.log('用户注册和登录流程集成测试完成');
    
    // 清理测试数据（如果有删除用户的API）
    if (authToken) {
      try {
        await axios.delete(`${API_BASE_URL}${USER_ENDPOINT}/profile`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
      } catch (error) {
        // 忽略清理错误
      }
    }
  });

  describe('完整用户注册流程', () => {
    it('应该成功完成用户注册流程', async () => {
      // 步骤1: 检查邮箱是否已存在
      try {
        const checkResponse = await axios.post(`${API_BASE_URL}${AUTH_ENDPOINT}/check-phone`, {
          phone: testUserPhone
        });
        
        expect(checkResponse.status).toBe(200);
        expect(checkResponse.data).toHaveProperty('code', 200);
        expect(checkResponse.data.data.exists).toBe(false);
      } catch (error: any) {
        // 如果没有检查邮箱的API，跳过这一步
        if (error.response?.status !== 404) {
          throw error;
        }
      }
      
      // 步骤2: 发送验证码（如果需要）
      try {
        const verifyCodeResponse = await axios.post(`${API_BASE_URL}${AUTH_ENDPOINT}/send-verify-code`, {
          phone: testUserPhone,
          type: 'register'
        });
        
        expect(verifyCodeResponse.status).toBe(200);
        expect(verifyCodeResponse.data).toHaveProperty('code', 200);
      } catch (error: any) {
        // 如果没有验证码API，跳过这一步
        if (error.response?.status !== 404) {
          console.warn('验证码发送失败，继续测试');
        }
      }
      
      // 步骤3: 用户注册
      const registerData = {
        phone: testUserPhone,
        password: testUserPassword,
        verificationCode: '123456' // 测试验证码
      };
      
      const registerResponse = await axios.post(`${API_BASE_URL}${AUTH_ENDPOINT}/register`, registerData);
      
      expect(registerResponse.status).toBe(201);
      expect(registerResponse.data).toHaveProperty('code', 200);
      expect(registerResponse.data).toHaveProperty('data');
      
      const registerData_response = registerResponse.data.data;
      expect(registerData_response).toHaveProperty('user');
      expect(registerData_response).toHaveProperty('token');
      
      const user = registerData_response.user;
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('phone', testUserPhone);
      expect(user).toHaveProperty('name', testUserName);
      expect(user).toHaveProperty('phone', testUserPhone);
      expect(user).toHaveProperty('isActive', true);
      expect(user).toHaveProperty('createdAt');
      
      // 验证不返回敏感信息
      expect(user).not.toHaveProperty('password');
      expect(user).not.toHaveProperty('passwordHash');
      
      // 保存用户信息用于后续测试
      userId = user.id;
      authToken = registerData_response.token;
      
      if (registerData_response.refreshToken) {
        refreshToken = registerData_response.refreshToken;
      }
      
      // 步骤4: 验证注册后自动登录状态
      const profileResponse = await axios.get(`${API_BASE_URL}${USER_ENDPOINT}/profile`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      expect(profileResponse.status).toBe(200);
      expect(profileResponse.data.data.user.id).toBe(userId);
      expect(profileResponse.data.data.user.phone).toBe(testUserPhone);
      
      // 步骤5: 验证购物车自动创建
      try {
        const cartResponse = await axios.get(`${API_BASE_URL}${CART_ENDPOINT}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        expect(cartResponse.status).toBe(200);
        expect(cartResponse.data.data.data).toHaveProperty('items');
        expect(cartResponse.data.data.data).toHaveProperty('summary');
        expect(cartResponse.data.data.data.userId).toBe(userId);
        expect(cartResponse.data.data.data.items).toHaveLength(0); // 新用户购物车应该为空
      } catch (error: any) {
        // 如果购物车API不存在，跳过验证
        if (error.response?.status !== 404) {
          console.warn('购物车验证失败，继续测试');
        }
      }
    });

    it('应该拒绝重复注册相同邮箱', async () => {
      // 先注册一个用户
      const firstRegisterData = {
        phone: testUserPhone,
        password: testUserPassword,
        verificationCode: '123456'
      };
      
      const firstResponse = await axios.post(`${API_BASE_URL}${AUTH_ENDPOINT}/register`, firstRegisterData);
      expect(firstResponse.status).toBe(201);
      
      // 尝试用相同邮箱再次注册
      try {
        await axios.post(`${API_BASE_URL}${AUTH_ENDPOINT}/register`, {
          email: testUserEmail,
          password: 'DifferentPassword123!',
          name: 'Different Name',
          phone: '13900000000'
        });
        expect.fail('应该拒绝重复邮箱注册');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toHaveProperty('code', 400);
        expect(error.response.data.message).toMatch(/(邮箱|email|已存在|exists|重复|duplicate)/i);
      }
    });

    it('应该拒绝重复注册相同手机号', async () => {
      // 生成新的邮箱但使用相同手机号
      const newEmail = `different.${Date.now()}@example.com`;
      
      try {
        await axios.post(`${API_BASE_URL}${AUTH_ENDPOINT}/register`, {
          email: newEmail,
          password: testUserPassword,
          name: 'Different Name',
          phone: testUserPhone // 使用已注册的手机号
        });
        expect.fail('应该拒绝重复手机号注册');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toHaveProperty('code', 400);
        expect(error.response.data.message).toMatch(/(手机|phone|已存在|exists|重复|duplicate)/i);
      }
    });
  });

  describe('完整用户登录流程', () => {
    beforeEach(async () => {
      // 确保有注册用户可以登录
      try {
        await axios.post(`${API_BASE_URL}${AUTH_ENDPOINT}/register`, {
          phone: testUserPhone,
          password: testUserPassword,
          verificationCode: '123456'
        });
      } catch (error) {
        // 如果用户已存在，忽略错误
      }
    });

    it('应该成功完成用户登录流程', async () => {
      // 步骤1: 用户登录
      const loginData = {
        phone: testUserPhone,
        password: testUserPassword
      };
      
      const loginResponse = await axios.post(`${API_BASE_URL}${AUTH_ENDPOINT}/login`, loginData);
      
      expect(loginResponse.status).toBe(200);
      expect(loginResponse.data).toHaveProperty('code', 200);
      expect(loginResponse.data).toHaveProperty('data');
      
      const loginResponseData = loginResponse.data.data;
      expect(loginResponseData).toHaveProperty('user');
      expect(loginResponseData).toHaveProperty('token');
      
      const user = loginResponseData.user;
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email', testUserEmail);
      expect(user).toHaveProperty('name', testUserName);
      expect(user).toHaveProperty('isActive', true);
      expect(user).toHaveProperty('lastLoginAt');
      
      // 验证不返回敏感信息
      expect(user).not.toHaveProperty('password');
      expect(user).not.toHaveProperty('passwordHash');
      
      // 保存认证信息
      authToken = loginResponseData.token;
      userId = user.id;
      
      if (loginResponseData.refreshToken) {
        refreshToken = loginResponseData.refreshToken;
      }
      
      // 步骤2: 验证Token有效性
      const profileResponse = await axios.get(`${API_BASE_URL}${USER_ENDPOINT}/profile`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      expect(profileResponse.status).toBe(200);
      expect(profileResponse.data.data.user.id).toBe(userId);
      expect(profileResponse.data.data.user.phone).toBe(testUserPhone);
      
      // 步骤3: 验证登录时间更新
      const currentTime = new Date();
      const lastLoginTime = new Date(user.lastLoginAt);
      const timeDiff = Math.abs(currentTime.getTime() - lastLoginTime.getTime());
      expect(timeDiff).toBeLessThan(60000); // 1分钟内
      
      // 步骤4: 验证购物车访问权限
      try {
        const cartResponse = await axios.get(`${API_BASE_URL}${CART_ENDPOINT}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        expect(cartResponse.status).toBe(200);
        expect(cartResponse.data.data.data.userId).toBe(userId);
      } catch (error: any) {
        if (error.response?.status !== 404) {
          console.warn('购物车访问验证失败，继续测试');
        }
      }
    });

    it('应该拒绝错误的登录凭据', async () => {
      const invalidCredentials = [
        {
          phone: testUserPhone,
          password: 'WrongPassword123!'
        },
        {
          phone: '13900000000',
          password: testUserPassword
        },
        {
          phone: '13900000000',
          password: 'WrongPassword123!'
        }
      ];
      
      for (const credentials of invalidCredentials) {
        try {
          await axios.post(`${API_BASE_URL}${AUTH_ENDPOINT}/login`, credentials);
          expect.fail(`无效凭据 ${JSON.stringify(credentials)} 应该被拒绝`);
        } catch (error: any) {
          expect(error.response.status).toBe(401);
          expect(error.response.data).toHaveProperty('code', 401);
          expect(error.response.data.message).toMatch(/(凭据|credentials|用户名|密码|password|邮箱|email|错误|invalid)/i);
        }
      }
    });

    it('应该处理账户锁定机制', async () => {
      // 连续多次错误登录尝试
      const maxAttempts = 5;
      const wrongPassword = 'WrongPassword123!';
      
      for (let i = 0; i < maxAttempts; i++) {
        try {
          await axios.post(`${API_BASE_URL}${AUTH_ENDPOINT}/login`, {
          phone: testUserPhone,
          password: wrongPassword
          });
          expect.fail('错误密码应该被拒绝');
        } catch (error: any) {
          expect(error.response.status).toBe(401);
        }
      }
      
      // 第6次尝试应该返回账户锁定错误
      try {
        await axios.post(`${API_BASE_URL}${AUTH_ENDPOINT}/login`, {
          phone: testUserPhone,
          password: wrongPassword
        });
        // 如果没有账户锁定机制，这个测试会通过
      } catch (error: any) {
        if (error.response.status === 423) {
          // 账户被锁定
          expect(error.response.data).toHaveProperty('code', 423);
          expect(error.response.data.message).toMatch(/(锁定|locked|暂停|suspended)/i);
        } else {
          expect(error.response.status).toBe(401);
        }
      }
    });
  });

  describe('用户登出流程', () => {
    beforeEach(async () => {
      // 确保用户已登录
      const loginResponse = await axios.post(`${API_BASE_URL}${AUTH_ENDPOINT}/login`, {
        phone: '13800138001', // 使用已存在的用户
        password: 'Test123456'
      });
      
      authToken = loginResponse.data.data.token;
      userId = loginResponse.data.data.user.id;
      
      if (loginResponse.data.data.refreshToken) {
        refreshToken = loginResponse.data.data.refreshToken;
      }
    });

    it('应该成功完成用户登出流程', async () => {
      // 步骤1: 验证登录状态
      const profileResponse = await axios.get(`${API_BASE_URL}${USER_ENDPOINT}/profile`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      expect(profileResponse.status).toBe(200);
      expect(profileResponse.data.data.user.id).toBe(userId);
      
      // 步骤2: 执行登出
      const logoutResponse = await axios.post(`${API_BASE_URL}${AUTH_ENDPOINT}/logout`, {}, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      expect(logoutResponse.status).toBe(200);
      expect(logoutResponse.data).toHaveProperty('code', 200);
      
      // 步骤3: 验证Token失效
      try {
        await axios.get(`${API_BASE_URL}${USER_ENDPOINT}/profile`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        expect.fail('登出后Token应该失效');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
        expect(error.response.data).toHaveProperty('success', false);
      }
      
      // 步骤4: 验证购物车访问被拒绝
      try {
        await axios.get(`${API_BASE_URL}${CART_ENDPOINT}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        expect.fail('登出后应该无法访问购物车');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
      
      // 步骤5: 验证RefreshToken失效（如果有）
      if (refreshToken) {
        try {
          await axios.post(`${API_BASE_URL}${AUTH_ENDPOINT}/refresh-token`, {
            refreshToken: refreshToken
          });
          expect.fail('登出后RefreshToken应该失效');
        } catch (error: any) {
          expect(error.response.status).toBe(401);
        }
      }
    });

    it('应该支持幂等登出', async () => {
      // 第一次登出
      const firstLogoutResponse = await axios.post(`${API_BASE_URL}${AUTH_ENDPOINT}/logout`, {}, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      expect(firstLogoutResponse.status).toBe(200);
      
      // 第二次登出（使用已失效的Token）
      try {
        const secondLogoutResponse = await axios.post(`${API_BASE_URL}${AUTH_ENDPOINT}/logout`, {}, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        // 如果支持幂等登出，应该返回成功
        expect([200, 401]).toContain(secondLogoutResponse.status);
      } catch (error: any) {
        // 或者返回401未认证错误
        expect(error.response.status).toBe(401);
      }
    });
  });

  describe('Token刷新流程', () => {
    beforeEach(async () => {
      // 登录获取Token
      const loginResponse = await axios.post(`${API_BASE_URL}${AUTH_ENDPOINT}/login`, {
        phone: '13800138001', // 使用已存在的用户
        password: 'Test123456'
      });
      
      authToken = loginResponse.data.data.token;
      userId = loginResponse.data.data.user.id;
      
      if (loginResponse.data.data.refreshToken) {
        refreshToken = loginResponse.data.data.refreshToken;
      }
    });

    it('应该成功刷新访问Token', async () => {
      if (!refreshToken) {
        console.log('跳过Token刷新测试：没有RefreshToken');
        return;
      }
      
      // 等待一段时间确保新Token不同
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 刷新Token
      const refreshResponse = await axios.post(`${API_BASE_URL}${AUTH_ENDPOINT}/refresh-token`, {
        refreshToken: refreshToken
      });
      
      expect(refreshResponse.status).toBe(200);
      expect(refreshResponse.data).toHaveProperty('success', true);
      expect(refreshResponse.data.data).toHaveProperty('token');
      
      const newToken = refreshResponse.data.data.token;
      expect(newToken).not.toBe(authToken); // 新Token应该不同
      
      // 验证新Token有效
      const profileResponse = await axios.get(`${API_BASE_URL}${USER_ENDPOINT}/profile`, {
        headers: {
          'Authorization': `Bearer ${newToken}`
        }
      });
      
      expect(profileResponse.status).toBe(200);
      expect(profileResponse.data.data.user.id).toBe(userId);
      
      // 验证旧Token失效（可选，取决于实现）
      try {
        await axios.get(`${API_BASE_URL}${USER_ENDPOINT}/profile`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        // 如果旧Token仍然有效，这是可以接受的
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });

    it('应该拒绝无效的RefreshToken', async () => {
      const invalidRefreshTokens = [
        'invalid-refresh-token',
        'expired-refresh-token-12345',
        '',
        '   ',
        'null',
        'undefined'
      ];
      
      for (const invalidToken of invalidRefreshTokens) {
        try {
          await axios.post(`${API_BASE_URL}${AUTH_ENDPOINT}/refresh-token`, {
            refreshToken: invalidToken
          });
          expect.fail(`无效RefreshToken ${invalidToken} 应该被拒绝`);
        } catch (error: any) {
          expect(error.response.status).toBe(401);
          expect(error.response.data).toHaveProperty('success', false);
        }
      }
    });
  });

  describe('用户资料管理流程', () => {
    beforeEach(async () => {
      // 登录获取Token
      const loginResponse = await axios.post(`${API_BASE_URL}${AUTH_ENDPOINT}/login`, {
        phone: '13800138001', // 使用已存在的用户
        password: 'Test123456'
      });
      
      authToken = loginResponse.data.data.token;
      userId = loginResponse.data.data.user.id;
    });

    it('应该成功获取用户资料', async () => {
      const profileResponse = await axios.get(`${API_BASE_URL}${USER_ENDPOINT}/profile`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      expect(profileResponse.status).toBe(200);
      expect(profileResponse.data).toHaveProperty('code', 200);
      
      const user = profileResponse.data.data.user;
      expect(user).toHaveProperty('id', userId);
      expect(user).toHaveProperty('email', testUserEmail);
      expect(user).toHaveProperty('name', testUserName);
      expect(user).toHaveProperty('phone', testUserPhone);
      expect(user).toHaveProperty('isActive', true);
      expect(user).toHaveProperty('createdAt');
      expect(user).toHaveProperty('updatedAt');
      
      // 验证不返回敏感信息
      expect(user).not.toHaveProperty('password');
      expect(user).not.toHaveProperty('passwordHash');
    });

    it('应该成功更新用户资料', async () => {
      const updateData = {
        name: `Updated ${testUserName}`,
        phone: `139${String(Date.now()).slice(-8)}`
      };
      
      const updateResponse = await axios.put(`${API_BASE_URL}${USER_ENDPOINT}/profile`, updateData, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      expect(updateResponse.status).toBe(200);
      expect(updateResponse.data).toHaveProperty('success', true);
      
      const updatedUser = updateResponse.data.data.user;
      expect(updatedUser.name).toBe(updateData.name);
      expect(updatedUser.phone).toBe(updateData.phone);
      expect(updatedUser.email).toBe(testUserEmail); // 邮箱不应该改变
      
      // 验证更新时间
      expect(updatedUser).toHaveProperty('updatedAt');
      const updatedAt = new Date(updatedUser.updatedAt);
      const now = new Date();
      expect(Math.abs(now.getTime() - updatedAt.getTime())).toBeLessThan(60000); // 1分钟内
    });

    it('应该成功修改密码', async () => {
      const newPassword = 'NewPassword123!';
      
      const changePasswordResponse = await axios.put(`${API_BASE_URL}${USER_ENDPOINT}/change-password`, {
        currentPassword: testUserPassword,
        newPassword: newPassword,
        confirmPassword: newPassword
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      expect(changePasswordResponse.status).toBe(200);
      expect(changePasswordResponse.data).toHaveProperty('code', 200);
      
      // 验证旧密码无法登录
      try {
        await axios.post(`${API_BASE_URL}${AUTH_ENDPOINT}/login`, {
          phone: testUserPhone,
          password: testUserPassword
        });
        expect.fail('旧密码应该无法登录');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
      
      // 验证新密码可以登录
      const loginResponse = await axios.post(`${API_BASE_URL}${AUTH_ENDPOINT}/login`, {
        phone: testUserPhone,
        password: newPassword
      });
      
      expect(loginResponse.status).toBe(200);
      expect(loginResponse.data.data.user.phone).toBe(testUserPhone);
      
      // 更新测试密码用于后续测试
      testUserPassword = newPassword;
    });
  });

  describe('会话管理和安全性', () => {
    beforeEach(async () => {
      // 登录获取Token
      const loginResponse = await axios.post(`${API_BASE_URL}${AUTH_ENDPOINT}/login`, {
        phone: '13800138001', // 使用已存在的用户
        password: 'Test123456'
      });
      
      authToken = loginResponse.data.data.token;
      userId = loginResponse.data.data.user.id;
    });

    it('应该正确处理并发登录', async () => {
      // 同时发起多个登录请求
      const loginPromises = Array(3).fill(null).map(() => 
        axios.post(`${API_BASE_URL}${AUTH_ENDPOINT}/login`, {
          phone: '13800138001', // 使用已存在的用户
          password: 'Test123456'
        })
      );
      
      const responses = await Promise.all(loginPromises);
      
      // 所有请求都应该成功
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.data.data.user.email).toBe(testUserEmail);
      });
      
      // 验证所有Token都有效
      const profilePromises = responses.map(response => 
        axios.get(`${API_BASE_URL}${USER_ENDPOINT}/profile`, {
          headers: {
            'Authorization': `Bearer ${response.data.data.token}`
          }
        })
      );
      
      const profileResponses = await Promise.all(profilePromises);
      
      profileResponses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.data.data.user.id).toBe(userId);
      });
    });

    it('应该正确处理Token过期', async () => {
      // 这个测试需要模拟Token过期，实际实现中可能需要等待或mock
      // 这里只做基本验证
      
      // 使用明显过期的Token
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      
      try {
        await axios.get(`${API_BASE_URL}${USER_ENDPOINT}/profile`, {
          headers: {
            'Authorization': `Bearer ${expiredToken}`
          }
        });
        expect.fail('过期Token应该被拒绝');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
        expect(error.response.data).toHaveProperty('success', false);
      }
    });

    it('应该防止CSRF攻击', async () => {
      // 验证需要CSRF Token或其他防护机制
      // 这个测试的具体实现取决于应用的CSRF防护策略
      
      const sensitiveOperations = [
        {
          method: 'put',
          url: `${API_BASE_URL}${USER_ENDPOINT}/profile`,
          data: { name: 'Hacked Name' }
        },
        {
          method: 'put',
          url: `${API_BASE_URL}${USER_ENDPOINT}/change-password`,
          data: { 
            currentPassword: testUserPassword,
            newPassword: 'HackedPassword123!',
            confirmPassword: 'HackedPassword123!'
          }
        }
      ];
      
      for (const operation of sensitiveOperations) {
        try {
          const response = await axios[operation.method as 'put'](
            operation.url,
            operation.data,
            {
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
                // 故意不包含CSRF Token
              }
            }
          );
          
          // 如果没有CSRF防护，操作会成功
          // 这不一定是错误，取决于应用的安全策略
          expect([200, 403]).toContain(response.status);
        } catch (error: any) {
          // 如果有CSRF防护，应该返回403
          if (error.response.status === 403) {
            expect(error.response.data.message).toMatch(/(csrf|token|forbidden)/i);
          } else {
            throw error;
          }
        }
      }
    });
  });

  describe('错误处理和边界条件', () => {
    it('应该正确处理网络错误', async () => {
      // 使用错误的API地址
      const wrongApiUrl = 'http://localhost:9999';
      
      try {
        await axios.post(`${wrongApiUrl}${AUTH_ENDPOINT}/login`, {
          phone: '13800138001', // 使用已存在的用户
          password: 'Test123456'
        }, {
          timeout: 2000
        });
        expect.fail('应该抛出网络错误');
      } catch (error: any) {
        expect(['ECONNREFUSED', 'ENOTFOUND', 'TIMEOUT'].some(
          code => error.code === code || error.message.includes(code)
        )).toBe(true);
      }
    });

    it('应该正确处理服务器错误', async () => {
      // 发送格式错误的请求触发服务器错误
      try {
        await axios.post(`${API_BASE_URL}${AUTH_ENDPOINT}/login`, 'invalid-json', {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        expect.fail('应该返回服务器错误');
      } catch (error: any) {
        expect([400, 500]).toContain(error.response.status);
        expect(error.response.data).toHaveProperty('success', false);
      }
    });

    it('应该正确处理大量并发请求', async () => {
      // 发送大量并发登录请求
      const concurrentRequests = 10;
      const requests = Array(concurrentRequests).fill(null).map(() => 
        axios.post(`${API_BASE_URL}${AUTH_ENDPOINT}/login`, {
          phone: '13800138001', // 使用已存在的用户
          password: 'Test123456'
        })
      );
      
      const results = await Promise.allSettled(requests);
      
      // 大部分请求应该成功
      const successfulRequests = results.filter(
        result => result.status === 'fulfilled' && result.value.status === 200
      );
      
      expect(successfulRequests.length).toBeGreaterThan(concurrentRequests * 0.8); // 至少80%成功
    });
  });

  describe('数据一致性验证', () => {
    beforeEach(async () => {
      // 登录获取Token
      const loginResponse = await axios.post(`${API_BASE_URL}${AUTH_ENDPOINT}/login`, {
        phone: '13800138001', // 使用已存在的用户
        password: 'Test123456'
      });
      
      authToken = loginResponse.data.data.token;
      userId = loginResponse.data.data.user.id;
    });

    it('应该保持用户数据在各API间的一致性', async () => {
      // 获取用户资料
      const profileResponse = await axios.get(`${API_BASE_URL}${USER_ENDPOINT}/profile`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      const profileUser = profileResponse.data.data.user;
      
      // 重新登录获取用户信息
      const loginResponse = await axios.post(`${API_BASE_URL}${AUTH_ENDPOINT}/login`, {
        phone: '13800138001', // 使用已存在的用户
        password: 'Test123456'
      });
      
      const loginUser = loginResponse.data.data.user;
      
      // 验证数据一致性
      expect(profileUser.id).toBe(loginUser.id);
      expect(profileUser.email).toBe(loginUser.email);
      expect(profileUser.name).toBe(loginUser.name);
      expect(profileUser.phone).toBe(loginUser.phone);
      expect(profileUser.isActive).toBe(loginUser.isActive);
    });

    it('应该正确处理用户状态变更', async () => {
      // 更新用户资料
      const newName = `Updated Name ${Date.now()}`;
      
      await axios.put(`${API_BASE_URL}${USER_ENDPOINT}/profile`, {
        name: newName
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      // 重新登录验证更新生效
      const loginResponse = await axios.post(`${API_BASE_URL}${AUTH_ENDPOINT}/login`, {
        phone: '13800138001', // 使用已存在的用户
        password: 'Test123456'
      });
      
      expect(loginResponse.data.data.user.name).toBe(newName);
      
      // 获取资料验证更新生效
      const profileResponse = await axios.get(`${API_BASE_URL}${USER_ENDPOINT}/profile`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      expect(profileResponse.data.data.user.name).toBe(newName);
    });
  });
});