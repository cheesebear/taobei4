import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import axios from 'axios';

// API合约测试：用户注册接口
// 测试 POST /api/auth/register 接口
// 验证请求参数、响应格式和业务逻辑

const API_BASE_URL = 'http://localhost:3001';
const REGISTER_ENDPOINT = '/api/auth/register';

describe('用户注册API合约测试', () => {
  let testUserId: string;

  beforeAll(async () => {
    // 确保测试环境干净
    console.log('开始用户注册API合约测试');
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

  describe('正常注册流程', () => {
    it('应该成功注册新用户', async () => {
      const registerData = {
        phone: '13900000002',
        password: 'Test123456',
        verificationCode: '123456'
      };

      const response = await axios.post(`${API_BASE_URL}${REGISTER_ENDPOINT}`, registerData);

      // 验证响应状态码
      expect(response.status).toBe(201);

      // 验证响应数据结构
      expect(response.data).toHaveProperty('code', 201);
      expect(response.data).toHaveProperty('message');
      expect(response.data).toHaveProperty('data');
      expect(response.data.data).toHaveProperty('userId');
      expect(response.data.data).toHaveProperty('token');
      expect(response.data.data).toHaveProperty('refreshToken');
      expect(response.data.data).toHaveProperty('userInfo');

      // 验证用户信息结构
      const userInfo = response.data.data.userInfo;
      expect(userInfo).toHaveProperty('id');
      expect(userInfo).toHaveProperty('phone', '13900000002');
      expect(userInfo).toHaveProperty('nickname');
      expect(userInfo).toHaveProperty('avatar');
      expect(userInfo).toHaveProperty('createdAt');
      expect(userInfo).not.toHaveProperty('password'); // 不应返回密码

      // 验证token格式
      expect(typeof response.data.data.token).toBe('string');
      expect(response.data.data.token.length).toBeGreaterThan(0);
      expect(typeof response.data.data.refreshToken).toBe('string');
      expect(response.data.data.refreshToken.length).toBeGreaterThan(0);

      testUserId = response.data.data.userId;
    });
  });

  describe('参数验证', () => {
    it('应该拒绝无效的手机号格式', async () => {
      const registerData = {
        phone: '13800138007',
        password: 'Test123456',
        verificationCode: '123456'
      };

      try {
        await axios.post(`${API_BASE_URL}${REGISTER_ENDPOINT}`, invalidData);
        expect.fail('应该抛出错误');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toHaveProperty('code', 400);
        expect(error.response.data).toHaveProperty('message');
        expect(error.response.data.message).toContain('手机号');
      }
    });

    it('应该拒绝密码不匹配', async () => {
      const invalidData = {
        phone: '13800138001',
        password: 'Test123456',
        confirmPassword: 'Test123457', // 密码不匹配
        verifyCode: '123456',
        agreementAccepted: true
      };

      try {
        await axios.post(`${API_BASE_URL}${REGISTER_ENDPOINT}`, invalidData);
        expect.fail('应该抛出错误');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toHaveProperty('code', 400);
        expect(error.response.data.message).toContain('密码');
      }
    });

    it('应该拒绝弱密码', async () => {
      const invalidData = {
        phone: '13800138002',
        password: '123', // 弱密码
        verificationCode: '123456'
      };

      try {
        await axios.post(`${API_BASE_URL}${REGISTER_ENDPOINT}`, invalidData);
        expect.fail('应该抛出错误');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toHaveProperty('code', 400);
        expect(error.response.data.message).toContain('密码');
      }
    });

    it('应该拒绝未同意协议', async () => {
      const invalidData = {
        phone: '13800138003',
        password: 'Test123456',
        verificationCode: '123456'
      };

      try {
        await axios.post(`${API_BASE_URL}${REGISTER_ENDPOINT}`, invalidData);
        expect.fail('应该抛出错误');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toHaveProperty('code', 400);
        expect(error.response.data.message).toContain('协议');
      }
    });

    it('应该拒绝缺少必填字段', async () => {
      const invalidData = {
        phone: '13800138004',
        // 缺少password字段
        verificationCode: '123456'
      };

      try {
        await axios.post(`${API_BASE_URL}${REGISTER_ENDPOINT}`, invalidData);
        expect.fail('应该抛出错误');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toHaveProperty('code', 409);
      }
    });
  });

  describe('业务逻辑验证', () => {
    it('应该拒绝重复注册相同手机号', async () => {
      const registerData = {
        phone: '13800138005',
        password: 'Test123456',
        verificationCode: '123456'
      };

      // 第一次注册
      await axios.post(`${API_BASE_URL}${REGISTER_ENDPOINT}`, registerData);

      // 第二次注册相同手机号
      try {
        await axios.post(`${API_BASE_URL}${REGISTER_ENDPOINT}`, registerData);
        expect.fail('应该抛出错误');
      } catch (error: any) {
        expect(error.response.status).toBe(409);
        expect(error.response.data).toHaveProperty('code', 400);
        expect(error.response.data.message).toContain('已注册');
      }
    });

    it('应该拒绝无效的验证码', async () => {
      const invalidData = {
        phone: '13800138006',
        password: 'Test123456',
        verificationCode: '000000' // 无效验证码
      };

      try {
        await axios.post(`${API_BASE_URL}${REGISTER_ENDPOINT}`, invalidData);
        expect.fail('应该抛出错误');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toHaveProperty('success', false);
        expect(error.response.data.message).toContain('验证码');
      }
    });
  });

  describe('响应头验证', () => {
    it('应该返回正确的Content-Type', async () => {
      const registerData = {
        phone: '13800138001',
        password: 'Test123456',
        verificationCode: '123456'
      };

      const response = await axios.post(`${API_BASE_URL}${REGISTER_ENDPOINT}`, registerData);
      
      expect(response.headers['content-type']).toContain('application/json');
    });
  });
});