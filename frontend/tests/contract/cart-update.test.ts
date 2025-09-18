import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import axios from 'axios';

// API合约测试：购物车更新商品接口
// 测试 PUT /api/cart/items/:itemId 接口
// 验证更新购物车商品数量的业务逻辑

const API_BASE_URL = 'http://localhost:3001';
const CART_ENDPOINT = '/api/cart';
const CART_ITEMS_ENDPOINT = '/api/cart/items';
const AUTH_ENDPOINT = '/api/auth';
const PRODUCTS_ENDPOINT = '/api/products';

describe('购物车更新商品API合约测试', () => {
  let authToken: string;
  let userId: string;
  let validProductId: string;
  let validVariantId: string;
  let cartItemId: string;
  
  beforeAll(async () => {
    console.log('开始购物车更新商品API合约测试');
    
    // 登录获取认证token
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}${AUTH_ENDPOINT}/login`, {
        email: 'test@example.com',
        password: 'password123'
      });
      
      if (loginResponse.data.success && loginResponse.data.data.token) {
        authToken = loginResponse.data.data.token;
        userId = loginResponse.data.data.user.id;
      } else {
        // 如果登录失败，尝试注册
        const registerResponse = await axios.post(`${API_BASE_URL}${AUTH_ENDPOINT}/register`, {
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
          phone: '13800138000'
        });
        
        if (registerResponse.data.success) {
          const loginRetry = await axios.post(`${API_BASE_URL}${AUTH_ENDPOINT}/login`, {
            email: 'test@example.com',
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
    
    // 获取有效的商品ID用于测试
    try {
      const productsResponse = await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}?limit=1`);
      if (productsResponse.data.data.products.length > 0) {
        const product = productsResponse.data.data.products[0];
        validProductId = product.id;
        
        // 如果商品有变体，获取第一个变体ID
        if (product.variants && product.variants.length > 0) {
          validVariantId = product.variants[0].id;
        }
      } else {
        validProductId = 'test-product-1';
        validVariantId = 'test-variant-1';
      }
    } catch (error) {
      validProductId = 'test-product-1';
      validVariantId = 'test-variant-1';
    }
  });

  beforeEach(async () => {
    // 每个测试前清空购物车并添加一个商品用于测试
    try {
      await axios.delete(`${API_BASE_URL}${CART_ENDPOINT}/clear`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
    } catch (error) {
      // 如果没有清空接口，忽略错误
    }
    
    // 添加一个商品到购物车用于测试更新
    try {
      const addResponse = await axios.post(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}`, {
        productId: validProductId,
        quantity: 2
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (addResponse.data.success && addResponse.data.data.item) {
        cartItemId = addResponse.data.data.item.id;
      } else {
        cartItemId = 'test-cart-item-1';
      }
    } catch (error) {
      cartItemId = 'test-cart-item-1';
    }
  });

  afterAll(async () => {
    console.log('购物车更新商品API合约测试完成');
  });

  describe('认证验证', () => {
    it('应该拒绝未认证的请求', async () => {
      try {
        await axios.put(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}/${cartItemId}`, {
          quantity: 3
        });
        expect.fail('应该抛出认证错误');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
        expect(error.response.data).toHaveProperty('code');
        expect(error.response.data.code).not.toBe(200);
        expect(error.response.data.message).toContain('认证');
      }
    });

    it('应该拒绝无效的token', async () => {
      const invalidTokens = [
        'invalid-token',
        'Bearer invalid-token',
        'expired-token-12345',
        '',
        '   '
      ];

      for (const token of invalidTokens) {
        try {
          await axios.put(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}/${cartItemId}`, {
            quantity: 3
          }, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          expect.fail(`无效token ${token} 应该被拒绝`);
        } catch (error: any) {
          expect(error.response.status).toBe(401);
          expect(error.response.data).toHaveProperty('code');
          expect(error.response.data.code).not.toBe(200);
        }
      }
    });
  });

  describe('基本更新功能', () => {
    it('应该成功更新购物车商品数量', async () => {
      const newQuantity = 5;
      
      const response = await axios.put(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}/${cartItemId}`, {
        quantity: newQuantity
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      // 验证响应状态码
      expect(response.status).toBe(200);

      // 验证响应数据结构
      expect(response.data).toHaveProperty('code', 200);
      expect(response.data).toHaveProperty('data');
      expect(response.data.data).toHaveProperty('item');
      expect(response.data.data).toHaveProperty('cart');

      const item = response.data.data.item;
      const cart = response.data.data.cart;

      // 验证更新的商品信息
      expect(item).toHaveProperty('id', cartItemId);
      expect(item).toHaveProperty('quantity', newQuantity);
      expect(item).toHaveProperty('price');
      expect(item).toHaveProperty('subtotal');
      expect(item).toHaveProperty('updatedAt');

      expect(typeof item.price).toBe('number');
      expect(typeof item.subtotal).toBe('number');
      expect(typeof item.updatedAt).toBe('string');

      expect(item.price).toBeGreaterThan(0);
      expect(item.subtotal).toBe(item.price * item.quantity);

      // 验证购物车更新
      expect(cart).toHaveProperty('items');
      expect(cart).toHaveProperty('summary');
      expect(cart.summary.totalQuantity).toBe(newQuantity);
    });

    it('应该成功更新商品数量为1', async () => {
      const response = await axios.put(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}/${cartItemId}`, {
        quantity: 1
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBe(200);
      
      const item = response.data.data.item;
      expect(item.quantity).toBe(1);
      expect(item.subtotal).toBe(item.price);
    });

    it('应该正确处理数量减少', async () => {
      // 先获取当前数量
      const cartResponse = await axios.get(`${API_BASE_URL}${CART_ENDPOINT}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      const currentItem = cartResponse.data.data.items.find((item: any) => item.id === cartItemId);
      const currentQuantity = currentItem.quantity;
      const newQuantity = Math.max(1, currentQuantity - 1);
      
      const response = await axios.put(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}/${cartItemId}`, {
        quantity: newQuantity
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBe(200);
      
      const item = response.data.data.item;
      expect(item.quantity).toBe(newQuantity);
      expect(item.subtotal).toBe(item.price * newQuantity);
    });

    it('应该正确处理数量增加', async () => {
      // 先获取当前数量
      const cartResponse = await axios.get(`${API_BASE_URL}${CART_ENDPOINT}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      const currentItem = cartResponse.data.data.items.find((item: any) => item.id === cartItemId);
      const currentQuantity = currentItem.quantity;
      const newQuantity = currentQuantity + 3;
      
      const response = await axios.put(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}/${cartItemId}`, {
        quantity: newQuantity
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBe(200);
      
      const item = response.data.data.item;
      expect(item.quantity).toBe(newQuantity);
      expect(item.subtotal).toBe(item.price * newQuantity);
    });

    it('应该正确计算更新后的价格和小计', async () => {
      const newQuantity = 7;
      
      const response = await axios.put(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}/${cartItemId}`, {
        quantity: newQuantity
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      const item = response.data.data.item;
      const cart = response.data.data.cart;

      // 验证价格计算
      expect(item.subtotal).toBe(item.price * item.quantity);
      
      // 验证购物车汇总
      const expectedSubtotal = cart.items.reduce(
        (sum: number, cartItem: any) => sum + cartItem.subtotal, 0
      );
      expect(Math.abs(cart.summary.subtotal - expectedSubtotal)).toBeLessThan(0.01);
    });
  });

  describe('参数验证', () => {
    it('应该拒绝缺少必需参数的请求', async () => {
      const invalidRequests = [
        {}, // 缺少quantity
        { quantity: '' }, // 空quantity
        { quantity: '   ' }, // 空白quantity
      ];

      for (const requestData of invalidRequests) {
        try {
          await axios.put(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}/${cartItemId}`, requestData, {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          });
          expect.fail(`无效请求数据 ${JSON.stringify(requestData)} 应该被拒绝`);
        } catch (error: any) {
          expect(error.response.status).toBe(400);
          expect(error.response.data).toHaveProperty('code');
          expect(error.response.data.code).not.toBe(200);
          expect(error.response.data.message).toMatch(/(参数|字段|必需|required)/i);
        }
      }
    });

    it('应该拒绝无效的商品项ID', async () => {
      const invalidItemIds = [
        'non-existent-item',
        'invalid-format-123',
        '12345',
        'null',
        'undefined',
        'item@invalid',
        'item#123',
        ''
      ];

      for (const itemId of invalidItemIds) {
        try {
          await axios.put(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}/${itemId}`, {
            quantity: 3
          }, {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          });
          expect.fail(`无效商品项ID ${itemId} 应该被拒绝`);
        } catch (error: any) {
          expect([400, 404]).toContain(error.response.status);
          expect(error.response.data).toHaveProperty('code');
          expect(error.response.data.code).not.toBe(200);
          expect(error.response.data.message).toMatch(/(商品|item|不存在|invalid)/i);
        }
      }
    });

    it('应该拒绝无效的数量', async () => {
      const invalidQuantities = [
        0,
        -1,
        -10,
        1.5,
        'invalid',
        '2',
        null,
        undefined,
        1001 // 假设最大数量是1000
      ];

      for (const quantity of invalidQuantities) {
        try {
          await axios.put(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}/${cartItemId}`, {
            quantity: quantity
          }, {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          });
          expect.fail(`无效数量 ${quantity} 应该被拒绝`);
        } catch (error: any) {
          expect(error.response.status).toBe(400);
          expect(error.response.data).toHaveProperty('code');
          expect(error.response.data.code).not.toBe(200);
          expect(error.response.data.message).toMatch(/(数量|quantity|范围|range)/i);
        }
      }
    });

    it('应该验证Content-Type', async () => {
      // 测试不正确的Content-Type
      try {
        await axios.put(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}/${cartItemId}`, {
          quantity: 3
        }, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'text/plain'
          }
        });
        expect.fail('应该拒绝错误的Content-Type');
      } catch (error: any) {
        expect([400, 415]).toContain(error.response.status);
        expect(error.response.data).toHaveProperty('code');
        expect(error.response.data.code).not.toBe(200);
      }
    });
  });

  describe('业务逻辑验证', () => {
    it('应该检查商品库存', async () => {
      // 尝试更新为超过库存的数量
      const largeQuantity = 9999;
      
      try {
        await axios.put(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}/${cartItemId}`, {
          quantity: largeQuantity
        }, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        expect.fail('应该拒绝超过库存的数量');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toHaveProperty('code');
        expect(error.response.data.code).not.toBe(200);
        expect(error.response.data.message).toMatch(/(库存|stock|不足|insufficient)/i);
      }
    });

    it('应该检查商品状态', async () => {
      // 获取当前商品信息
      const response = await axios.put(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}/${cartItemId}`, {
        quantity: 1
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      expect(response.status).toBe(200);
      
      const item = response.data.data.item;
      expect(item.product.isActive).toBe(true);
      expect(['active', 'published']).toContain(item.product.status);
    });

    it('应该检查用户权限', async () => {
      // 验证只能更新自己购物车中的商品
      const response = await axios.put(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}/${cartItemId}`, {
        quantity: 3
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      expect(response.status).toBe(200);
      
      const cart = response.data.data.cart;
      expect(cart.userId).toBe(userId);
    });

    it('应该正确处理价格变化', async () => {
      // 更新商品数量
      const response = await axios.put(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}/${cartItemId}`, {
        quantity: 4
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      expect(response.status).toBe(200);
      
      const item = response.data.data.item;
      
      // 验证价格是当前价格
      expect(item.price).toBeGreaterThan(0);
      expect(typeof item.price).toBe('number');
      
      // 如果有原价信息，验证折扣计算
      if (item.originalPrice) {
        expect(item.originalPrice).toBeGreaterThanOrEqual(item.price);
        if (item.discount) {
          const expectedPrice = item.originalPrice * (1 - item.discount);
          expect(Math.abs(item.price - expectedPrice)).toBeLessThan(0.01);
        }
      }
    });

    it('应该处理并发更新', async () => {
      // 同时发送多个更新请求
      const requests = [
        axios.put(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}/${cartItemId}`, {
          quantity: 3
        }, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }),
        axios.put(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}/${cartItemId}`, {
          quantity: 5
        }, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        })
      ];
      
      const responses = await Promise.allSettled(requests);
      
      // 至少有一个请求应该成功
      const successfulResponses = responses.filter(
        (result): result is PromiseFulfilledResult<any> => 
          result.status === 'fulfilled' && result.value.status === 200
      );
      
      expect(successfulResponses.length).toBeGreaterThan(0);
      
      // 验证最终状态一致性
      const finalCartResponse = await axios.get(`${API_BASE_URL}${CART_ENDPOINT}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      const finalItem = finalCartResponse.data.data.items.find(
        (item: any) => item.id === cartItemId
      );
      expect([3, 5]).toContain(finalItem.quantity);
    });
  });

  describe('响应数据验证', () => {
    it('应该返回完整的商品信息', async () => {
      const response = await axios.put(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}/${cartItemId}`, {
        quantity: 3
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const item = response.data.data.item;
      
      // 验证商品信息完整性
      expect(item).toHaveProperty('product');
      
      const product = item.product;
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('title');
      expect(product).toHaveProperty('image');
      expect(product).toHaveProperty('category');
      expect(product).toHaveProperty('brand');
      expect(product).toHaveProperty('stock');
      expect(product).toHaveProperty('status');
      expect(product).toHaveProperty('isActive');
      
      expect(typeof product.title).toBe('string');
      expect(typeof product.image).toBe('string');
      expect(typeof product.stock).toBe('number');
      expect(typeof product.isActive).toBe('boolean');
      
      expect(product.isActive).toBe(true);
      expect(['active', 'published']).toContain(product.status);
    });

    it('应该返回更新后的购物车汇总', async () => {
      const newQuantity = 6;
      
      const response = await axios.put(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}/${cartItemId}`, {
        quantity: newQuantity
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const cart = response.data.data.cart;
      const summary = cart.summary;
      
      // 验证汇总信息
      expect(summary).toHaveProperty('itemCount');
      expect(summary).toHaveProperty('totalQuantity');
      expect(summary).toHaveProperty('subtotal');
      expect(summary).toHaveProperty('total');
      
      expect(summary.itemCount).toBeGreaterThan(0);
      expect(summary.totalQuantity).toBe(newQuantity);
      expect(summary.subtotal).toBeGreaterThan(0);
      expect(summary.total).toBeGreaterThan(0);
      
      // 验证汇总计算正确性
      const calculatedSubtotal = cart.items.reduce(
        (sum: number, item: any) => sum + item.subtotal, 0
      );
      expect(Math.abs(summary.subtotal - calculatedSubtotal)).toBeLessThan(0.01);
    });

    it('应该包含更新时间戳', async () => {
      const beforeUpdate = new Date().toISOString();
      
      const response = await axios.put(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}/${cartItemId}`, {
        quantity: 4
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const afterUpdate = new Date().toISOString();
      
      const item = response.data.data.item;
      expect(item).toHaveProperty('updatedAt');
      
      const updatedAt = new Date(item.updatedAt).toISOString();
      expect(updatedAt >= beforeUpdate).toBe(true);
      expect(updatedAt <= afterUpdate).toBe(true);
    });
  });

  describe('响应头验证', () => {
    it('应该返回正确的Content-Type', async () => {
      const response = await axios.put(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}/${cartItemId}`, {
        quantity: 3
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      expect(response.headers['content-type']).toContain('application/json');
    });

    it('应该包含Last-Modified头', async () => {
      const response = await axios.put(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}/${cartItemId}`, {
        quantity: 3
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      // 更新操作应该包含Last-Modified头
      if (response.headers['last-modified']) {
        expect(typeof response.headers['last-modified']).toBe('string');
      }
    });
  });

  describe('性能验证', () => {
    it('应该在合理时间内更新商品', async () => {
      const startTime = Date.now();
      
      const response = await axios.put(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}/${cartItemId}`, {
        quantity: 3
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const endTime = Date.now();
      
      expect(response.status).toBe(200);
      expect(endTime - startTime).toBeLessThan(2000); // 2秒内完成
    });

    it('应该支持批量更新操作', async () => {
      // 连续更新多次
      const updates = [1, 2, 3, 4, 5];
      
      for (const quantity of updates) {
        const response = await axios.put(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}/${cartItemId}`, {
          quantity: quantity
        }, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        expect(response.status).toBe(200);
        expect(response.data.data.item.quantity).toBe(quantity);
      }
    });
  });

  describe('安全性验证', () => {
    it('应该防止更新其他用户的购物车商品', async () => {
      // 尝试使用不存在的商品项ID（模拟其他用户的商品）
      const otherUserItemId = 'other-user-item-123';
      
      try {
        await axios.put(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}/${otherUserItemId}`, {
          quantity: 10
        }, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        expect.fail('应该拒绝更新其他用户的商品');
      } catch (error: any) {
        expect([403, 404]).toContain(error.response.status);
        expect(error.response.data).toHaveProperty('code');
        expect(error.response.data.code).not.toBe(200);
      }
    });

    it('应该正确处理恶意输入', async () => {
      const maliciousInputs = [
        {
          quantity: "'; DROP TABLE cart_items; --"
        },
        {
          quantity: "<script>alert('xss')</script>"
        },
        {
          quantity: "../../../etc/passwd"
        }
      ];
      
      for (const input of maliciousInputs) {
        try {
          await axios.put(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}/${cartItemId}`, input, {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          });
          expect.fail(`恶意输入 ${JSON.stringify(input)} 应该被拒绝`);
        } catch (error: any) {
          expect(error.response.status).toBe(400);
          expect(error.response.data).toHaveProperty('code');
          expect(error.response.data.code).not.toBe(200);
        }
      }
    });

    it('应该不暴露敏感信息', async () => {
      const response = await axios.put(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}/${cartItemId}`, {
        quantity: 3
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const responseString = JSON.stringify(response.data).toLowerCase();
      
      // 确保不包含敏感字段
      const sensitiveFields = ['password', 'secret', 'key', 'token', 'private', 'admin'];
      sensitiveFields.forEach(field => {
        expect(responseString).not.toContain(field);
      });
    });
  });

  describe('边界条件验证', () => {
    it('应该处理最大数量限制', async () => {
      const maxQuantity = 999; // 假设最大数量
      
      const response = await axios.put(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}/${cartItemId}`, {
        quantity: maxQuantity
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      // 应该成功或返回库存不足错误
      if (response.status === 200) {
        expect(response.data.data.item.quantity).toBeLessThanOrEqual(maxQuantity);
      }
    });

    it('应该处理网络中断后的重试', async () => {
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        try {
          const response = await axios.put(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}/${cartItemId}`, {
            quantity: 3
          }, {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
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

    it('应该处理数量为0的特殊情况', async () => {
      // 数量为0应该删除商品或返回错误
      try {
        const response = await axios.put(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}/${cartItemId}`, {
          quantity: 0
        }, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        // 如果成功，商品应该被删除
        if (response.status === 200) {
          const cart = response.data.data.cart;
          const item = cart.items.find((item: any) => item.id === cartItemId);
          expect(item).toBeUndefined();
        }
      } catch (error: any) {
        // 或者返回400错误
        expect(error.response.status).toBe(400);
        expect(error.response.data).toHaveProperty('code');
        expect(error.response.data.code).not.toBe(200);
      }
    });
  });

  describe('幂等性验证', () => {
    it('应该支持幂等更新', async () => {
      const quantity = 4;
      
      // 第一次更新
      const firstResponse = await axios.put(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}/${cartItemId}`, {
        quantity: quantity
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      expect(firstResponse.status).toBe(200);
      
      // 第二次相同更新
      const secondResponse = await axios.put(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}/${cartItemId}`, {
        quantity: quantity
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      expect(secondResponse.status).toBe(200);
      
      // 验证结果一致
      expect(firstResponse.data.data.item.quantity).toBe(secondResponse.data.data.item.quantity);
      expect(firstResponse.data.data.item.subtotal).toBe(secondResponse.data.data.item.subtotal);
    });
  });
});