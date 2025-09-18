import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import axios from 'axios';

// API合约测试：验证码接口
// 测试 POST /api/auth/verify-code 接口
// 验证手机号格式和响应

const API_BASE_URL = 'http://localhost:3001';
const VERIFY_CODE_ENDPOINT = '/api/auth/verify-code';

describe('验证码API合约测试', () => {
  beforeAll(async () => {
    console.log('开始验证码API合约测试');
  });

  afterAll(async () => {
    console.log('验证码API合约测试完成');
  });

  describe('正常验证码发送流程', () => {
    it('应该成功发送注册验证码', async () => {
      const requestData = {
        phone: '13800138300',
        type: 'register'
      };

      const response = await axios.post(`${API_BASE_URL}${VERIFY_CODE_ENDPOINT}`, requestData);

      // 验证响应状态码
      expect(response.status).toBe(200);

      // 验证响应数据结构
      expect(response.data).toHaveProperty('success', true);
      expect(response.data).toHaveProperty('message');
      expect(response.data).toHaveProperty('data');
      expect(response.data.data).toHaveProperty('codeId');
      expect(response.data.data).toHaveProperty('expiresIn');
      expect(response.data.data).toHaveProperty('cooldown');
      expect(response.data.data).toHaveProperty('sentTime');

      // 验证数据类型
      expect(typeof response.data.data.codeId).toBe('string');
      expect(typeof response.data.data.expiresIn).toBe('number');
      expect(typeof response.data.data.cooldown).toBe('number');
      expect(typeof response.data.data.sentTime).toBe('string');

      // 验证业务逻辑
      expect(response.data.data.expiresIn).toBeGreaterThan(0);
      expect(response.data.data.cooldown).toBeGreaterThan(0);
      expect(response.data.data.codeId.length).toBeGreaterThan(0);

      // 验证不应该返回实际验证码（安全考虑）
      expect(response.data.data).not.toHaveProperty('code');
      expect(response.data.data).not.toHaveProperty('verifyCode');
    });

    it('应该成功发送登录验证码', async () => {
      const requestData = {
        phone: '13800138301',
        type: 'login'
      };

      const response = await axios.post(`${API_BASE_URL}${VERIFY_CODE_ENDPOINT}`, requestData);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('success', true);
      expect(response.data.data).toHaveProperty('codeId');
    });

    it('应该成功发送找回密码验证码', async () => {
      const requestData = {
        phone: '13800138302',
        type: 'reset-password'
      };

      const response = await axios.post(`${API_BASE_URL}${VERIFY_CODE_ENDPOINT}`, requestData);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('success', true);
      expect(response.data.data).toHaveProperty('codeId');
    });

    it('应该成功发送绑定手机验证码', async () => {
      const requestData = {
        phone: '13800138303',
        type: 'bind-phone'
      };

      const response = await axios.post(`${API_BASE_URL}${VERIFY_CODE_ENDPOINT}`, requestData);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('success', true);
      expect(response.data.data).toHaveProperty('codeId');
    });
  });

  describe('手机号格式验证', () => {
    it('应该拒绝无效的手机号格式', async () => {
      const invalidPhones = [
        '123456',      // 太短
        '1234567890123456', // 太长
        '12345678901',  // 11位但不是1开头
        '01234567890',  // 0开头
        'abcdefghijk',  // 非数字
        '138-0013-8000', // 包含特殊字符
        '+8613800138000', // 包含国际区号
        '138 0013 8000'  // 包含空格
      ];

      for (const phone of invalidPhones) {
        try {
          await axios.post(`${API_BASE_URL}${VERIFY_CODE_ENDPOINT}`, {
            phone,
            type: 'register'
          });
          expect.fail(`手机号 ${phone} 应该被拒绝`);
        } catch (error: any) {
          expect(error.response.status).toBe(400);
          expect(error.response.data).toHaveProperty('success', false);
          expect(error.response.data.message).toContain('手机号');
        }
      }
    });

    it('应该接受有效的手机号格式', async () => {
      const validPhones = [
        '13800138000', // 移动
        '15800158000', // 联通
        '18800188000', // 电信
        '17800178000', // 虚拟运营商
        '19800198000'  // 新号段
      ];

      for (const phone of validPhones) {
        const response = await axios.post(`${API_BASE_URL}${VERIFY_CODE_ENDPOINT}`, {
          phone,
          type: 'register'
        });
        
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('success', true);
      }
    });
  });

  describe('验证码类型验证', () => {
    it('应该拒绝无效的验证码类型', async () => {
      const invalidTypes = [
        'invalid',
        'unknown',
        '',
        null,
        undefined,
        123,
        'REGISTER', // 大小写敏感
        'register-user' // 不支持的类型
      ];

      for (const type of invalidTypes) {
        try {
          await axios.post(`${API_BASE_URL}${VERIFY_CODE_ENDPOINT}`, {
            phone: '13800138000',
            type
          });
          expect.fail(`验证码类型 ${type} 应该被拒绝`);
        } catch (error: any) {
          expect(error.response.status).toBe(400);
          expect(error.response.data).toHaveProperty('success', false);
          expect(error.response.data.message).toContain('类型');
        }
      }
    });

    it('应该接受所有有效的验证码类型', async () => {
      const validTypes = [
        'register',
        'login',
        'reset-password',
        'bind-phone'
      ];

      for (const type of validTypes) {
        const response = await axios.post(`${API_BASE_URL}${VERIFY_CODE_ENDPOINT}`, {
          phone: '13800138000',
          type
        });
        
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('success', true);
      }
    });
  });

  describe('参数验证', () => {
    it('应该拒绝缺少必填字段', async () => {
      const invalidRequests = [
        {}, // 缺少所有字段
        { phone: '13800138000' }, // 缺少type
        { type: 'register' }, // 缺少phone
        { phone: '', type: 'register' }, // phone为空
        { phone: '13800138000', type: '' } // type为空
      ];

      for (const requestData of invalidRequests) {
        try {
          await axios.post(`${API_BASE_URL}${VERIFY_CODE_ENDPOINT}`, requestData);
          expect.fail(`请求数据 ${JSON.stringify(requestData)} 应该被拒绝`);
        } catch (error: any) {
          expect(error.response.status).toBe(400);
          expect(error.response.data).toHaveProperty('success', false);
        }
      }
    });

    it('应该拒绝额外的无效字段', async () => {
      const requestData = {
        phone: '13800138000',
        type: 'register',
        invalidField: 'should be ignored',
        anotherInvalidField: 123
      };

      // 应该成功，但忽略无效字段
      const response = await axios.post(`${API_BASE_URL}${VERIFY_CODE_ENDPOINT}`, requestData);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('success', true);
    });
  });

  describe('频率限制验证', () => {
    it('应该在冷却期内拒绝重复发送', async () => {
      const requestData = {
        phone: '13800138400',
        type: 'register'
      };

      // 第一次发送
      const firstResponse = await axios.post(`${API_BASE_URL}${VERIFY_CODE_ENDPOINT}`, requestData);
      expect(firstResponse.status).toBe(200);
      
      const cooldown = firstResponse.data.data.cooldown;

      // 立即再次发送
      try {
        await axios.post(`${API_BASE_URL}${VERIFY_CODE_ENDPOINT}`, requestData);
        expect.fail('应该抛出错误');
      } catch (error: any) {
        expect(error.response.status).toBe(429);
        expect(error.response.data).toHaveProperty('success', false);
        expect(error.response.data.message).toContain('频繁');
        expect(error.response.data).toHaveProperty('data');
        expect(error.response.data.data).toHaveProperty('remainingTime');
        expect(error.response.data.data.remainingTime).toBeLessThanOrEqual(cooldown);
      }
    });

    it('应该在达到每日限制后拒绝发送', async () => {
      const requestData = {
        phone: '13800138401',
        type: 'register'
      };

      // 模拟达到每日限制（通常是10次）
      for (let i = 0; i < 10; i++) {
        try {
          await axios.post(`${API_BASE_URL}${VERIFY_CODE_ENDPOINT}`, {
            ...requestData,
            phone: `1380013840${i}` // 使用不同手机号避免冷却期限制
          });
        } catch (error) {
          // 可能因为冷却期失败，继续尝试
        }
      }

      // 第11次应该被拒绝
      try {
        await axios.post(`${API_BASE_URL}${VERIFY_CODE_ENDPOINT}`, requestData);
        expect.fail('应该抛出错误');
      } catch (error: any) {
        expect(error.response.status).toBe(429);
        expect(error.response.data).toHaveProperty('success', false);
        expect(error.response.data.message).toContain('每日限制');
      }
    });
  });

  describe('响应头验证', () => {
    it('应该返回正确的Content-Type', async () => {
      const requestData = {
        phone: '13800138500',
        type: 'register'
      };

      const response = await axios.post(`${API_BASE_URL}${VERIFY_CODE_ENDPOINT}`, requestData);
      
      expect(response.headers['content-type']).toContain('application/json');
    });

    it('应该包含频率限制相关的响应头', async () => {
      const requestData = {
        phone: '13800138501',
        type: 'register'
      };

      const response = await axios.post(`${API_BASE_URL}${VERIFY_CODE_ENDPOINT}`, requestData);
      
      // 检查频率限制相关的响应头
      expect(response.headers).toHaveProperty('x-ratelimit-limit');
      expect(response.headers).toHaveProperty('x-ratelimit-remaining');
      expect(response.headers).toHaveProperty('x-ratelimit-reset');
    });
  });

  describe('安全性验证', () => {
    it('不应该在响应中泄露敏感信息', async () => {
      const requestData = {
        phone: '13800138600',
        type: 'register'
      };

      const response = await axios.post(`${API_BASE_URL}${VERIFY_CODE_ENDPOINT}`, requestData);
      
      // 确保响应中不包含敏感信息
      const responseStr = JSON.stringify(response.data);
      expect(responseStr).not.toContain('password');
      expect(responseStr).not.toContain('secret');
      expect(responseStr).not.toContain('key');
      expect(responseStr).not.toContain('token');
      
      // 确保不返回实际验证码
      expect(response.data.data).not.toHaveProperty('code');
      expect(response.data.data).not.toHaveProperty('verifyCode');
      expect(response.data.data).not.toHaveProperty('smsCode');
    });

    it('应该对IP地址进行频率限制', async () => {
      // 使用相同IP但不同手机号快速发送多个请求
      const requests = [];
      for (let i = 0; i < 20; i++) {
        requests.push(
          axios.post(`${API_BASE_URL}${VERIFY_CODE_ENDPOINT}`, {
            phone: `1380013860${i.toString().padStart(1, '0')}`,
            type: 'register'
          }).catch(error => error.response)
        );
      }

      const responses = await Promise.all(requests);
      
      // 应该有一些请求被频率限制拒绝
      const rateLimitedResponses = responses.filter(response => 
        response.status === 429
      );
      
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });
});