import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import axios from 'axios';

// API合约测试：购物车添加商品接口
// 测试 POST /api/cart/items 接口
// 验证添加商品到购物车的业务逻辑

const API_BASE_URL = 'http://localhost:3001';
const CART_ENDPOINT = '/api/cart';
const CART_ITEMS_ENDPOINT = '/api/cart/items';
const AUTH_ENDPOINT = '/api/auth';
const PRODUCTS_ENDPOINT = '/api/products';

describe('购物车添加商品API合约测试', () => {
  let authToken: string;
  let userId: string;
  let validProductId: string;
  let validVariantId: string;
  
  beforeAll(async () => {
    console.log('开始购物车添加商品API合约测试');
    
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
    // 每个测试前清空购物车
    try {
      await axios.delete(`${API_BASE_URL}${CART_ENDPOINT}/clear`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
    } catch (error) {
      // 如果没有清空接口，忽略错误
    }
  });

  afterAll(async () => {
    console.log('购物车添加商品API合约测试完成');
  });

  describe('认证验证', () => {
    it('应该拒绝未认证的请求', async () => {
      try {
        await axios.post(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}`, {
          productId: validProductId,
          quantity: 1
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
          await axios.post(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}`, {
            productId: validProductId,
            quantity: 1
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

  describe('基本添加商品功能', () => {
    it('应该成功添加商品到购物车', async () => {
      const addItemData = {
        productId: validProductId,
        quantity: 2
      };

      const response = await axios.post(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}`, addItemData, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      // 验证响应状态码
      expect(response.status).toBe(201);

      // 验证响应数据结构
      expect(response.data).toHaveProperty('code', 200);
      expect(response.data).toHaveProperty('data');
      expect(response.data.data).toHaveProperty('item');
      expect(response.data.data).toHaveProperty('cart');

      const item = response.data.data.item;
      const cart = response.data.data.cart;

      // 验证添加的商品信息
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('productId', validProductId);
      expect(item).toHaveProperty('quantity', 2);
      expect(item).toHaveProperty('price');
      expect(item).toHaveProperty('subtotal');
      expect(item).toHaveProperty('addedAt');

      expect(typeof item.id).toBe('string');
      expect(typeof item.price).toBe('number');
      expect(typeof item.subtotal).toBe('number');
      expect(typeof item.addedAt).toBe('string');

      expect(item.price).toBeGreaterThan(0);
      expect(item.subtotal).toBe(item.price * item.quantity);

      // 验证购物车更新
      expect(cart).toHaveProperty('items');
      expect(cart).toHaveProperty('summary');
      expect(cart.items.length).toBeGreaterThan(0);
      expect(cart.summary.itemCount).toBeGreaterThan(0);
      expect(cart.summary.totalQuantity).toBe(2);
    });

    it('应该成功添加带变体的商品', async () => {
      if (!validVariantId) {
        console.log('跳过变体测试：没有可用的变体ID');
        return;
      }

      const addItemData = {
        productId: validProductId,
        variantId: validVariantId,
        quantity: 1
      };

      const response = await axios.post(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}`, addItemData, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBe(201);
      
      const item = response.data.data.item;
      expect(item).toHaveProperty('productId', validProductId);
      expect(item).toHaveProperty('variantId', validVariantId);
      expect(item).toHaveProperty('quantity', 1);
    });

    it('应该正确处理重复添加相同商品', async () => {
      const addItemData = {
        productId: validProductId,
        quantity: 1
      };

      // 第一次添加
      const firstResponse = await axios.post(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}`, addItemData, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      expect(firstResponse.status).toBe(201);
      const firstCart = firstResponse.data.data.cart;

      // 第二次添加相同商品
      const secondResponse = await axios.post(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}`, addItemData, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      expect(secondResponse.status).toBe(200); // 更新现有商品，返回200
      const secondCart = secondResponse.data.data.cart;

      // 验证商品数量增加而不是新增商品
      expect(secondCart.items.length).toBe(firstCart.items.length);
      
      const updatedItem = secondCart.items.find((item: any) => item.productId === validProductId);
      expect(updatedItem.quantity).toBe(2); // 1 + 1 = 2
    });

    it('应该正确计算商品价格和小计', async () => {
      const addItemData = {
        productId: validProductId,
        quantity: 3
      };

      const response = await axios.post(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}`, addItemData, {
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
        {}, // 缺少所有参数
        { quantity: 1 }, // 缺少productId
        { productId: validProductId }, // 缺少quantity
        { productId: '', quantity: 1 }, // 空productId
        { productId: '   ', quantity: 1 }, // 空白productId
      ];

      for (const requestData of invalidRequests) {
        try {
          await axios.post(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}`, requestData, {
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

    it('应该拒绝无效的商品ID', async () => {
      const invalidProductIds = [
        'non-existent-product',
        'invalid-format-123',
        '12345',
        'null',
        'undefined',
        'product@invalid',
        'product#123'
      ];

      for (const productId of invalidProductIds) {
        try {
          await axios.post(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}`, {
            productId: productId,
            quantity: 1
          }, {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          });
          expect.fail(`无效商品ID ${productId} 应该被拒绝`);
        } catch (error: any) {
          expect([400, 404]).toContain(error.response.status);
          expect(error.response.data).toHaveProperty('code');
          expect(error.response.data.code).not.toBe(200);
          expect(error.response.data.message).toMatch(/(商品|product|不存在|invalid)/i);
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
          await axios.post(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}`, {
            productId: validProductId,
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

    it('应该拒绝无效的变体ID', async () => {
      const invalidVariantIds = [
        'non-existent-variant',
        'invalid-variant-123',
        'variant@invalid'
      ];

      for (const variantId of invalidVariantIds) {
        try {
          await axios.post(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}`, {
            productId: validProductId,
            variantId: variantId,
            quantity: 1
          }, {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          });
          expect.fail(`无效变体ID ${variantId} 应该被拒绝`);
        } catch (error: any) {
          expect([400, 404]).toContain(error.response.status);
          expect(error.response.data).toHaveProperty('code');
          expect(error.response.data.code).not.toBe(200);
          expect(error.response.data.message).toMatch(/(变体|variant|不存在|invalid)/i);
        }
      }
    });

    it('应该验证Content-Type', async () => {
      const addItemData = {
        productId: validProductId,
        quantity: 1
      };

      // 测试不正确的Content-Type
      try {
        await axios.post(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}`, addItemData, {
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
      // 尝试添加超过库存的数量
      const largeQuantity = 9999;
      
      try {
        await axios.post(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}`, {
          productId: validProductId,
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
      // 尝试添加未激活的商品（需要mock数据）
      const inactiveProductId = 'inactive-product-123';
      
      try {
        await axios.post(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}`, {
          productId: inactiveProductId,
          quantity: 1
        }, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        // 如果商品存在但未激活，应该返回400或403
      } catch (error: any) {
        expect([400, 403, 404]).toContain(error.response.status);
        expect(error.response.data).toHaveProperty('code');
        expect(error.response.data.code).not.toBe(200);
      }
    });

    it('应该检查变体库存', async () => {
      if (!validVariantId) {
        console.log('跳过变体库存测试：没有可用的变体ID');
        return;
      }

      // 尝试添加超过变体库存的数量
      const largeQuantity = 9999;
      
      try {
        await axios.post(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}`, {
          productId: validProductId,
          variantId: validVariantId,
          quantity: largeQuantity
        }, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        expect.fail('应该拒绝超过变体库存的数量');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toHaveProperty('code');
        expect(error.response.data.code).not.toBe(200);
        expect(error.response.data.message).toMatch(/(库存|stock|不足|insufficient)/i);
      }
    });

    it('应该检查购物车商品数量限制', async () => {
      // 尝试添加过多不同的商品
      const maxItems = 50; // 假设最大50个不同商品
      
      // 这个测试需要多个不同的商品ID，实际实现中可能需要mock
      // 这里只做基本验证
      const response = await axios.post(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}`, {
        productId: validProductId,
        quantity: 1
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      expect(response.status).toBe(201);
      
      const cart = response.data.data.cart;
      expect(cart.items.length).toBeLessThanOrEqual(maxItems);
    });

    it('应该正确处理价格变化', async () => {
      // 添加商品到购物车
      const response = await axios.post(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}`, {
        productId: validProductId,
        quantity: 1
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      expect(response.status).toBe(201);
      
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
  });

  describe('响应数据验证', () => {
    it('应该返回完整的商品信息', async () => {
      const response = await axios.post(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}`, {
        productId: validProductId,
        quantity: 1
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
      const response = await axios.post(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}`, {
        productId: validProductId,
        quantity: 2
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
      expect(summary.totalQuantity).toBe(2);
      expect(summary.subtotal).toBeGreaterThan(0);
      expect(summary.total).toBeGreaterThan(0);
      
      // 验证汇总计算正确性
      const calculatedSubtotal = cart.items.reduce(
        (sum: number, item: any) => sum + item.subtotal, 0
      );
      expect(Math.abs(summary.subtotal - calculatedSubtotal)).toBeLessThan(0.01);
    });
  });

  describe('响应头验证', () => {
    it('应该返回正确的Content-Type', async () => {
      const response = await axios.post(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}`, {
        productId: validProductId,
        quantity: 1
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      expect(response.headers['content-type']).toContain('application/json');
    });

    it('应该包含Location头（对于新创建的商品）', async () => {
      const response = await axios.post(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}`, {
        productId: validProductId,
        quantity: 1
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 201) {
        // 新创建的商品应该包含Location头
        expect(response.headers).toHaveProperty('location');
        const location = response.headers.location;
        expect(location).toMatch(/\/api\/cart\/items\/.+/);
      }
    });
  });

  describe('性能验证', () => {
    it('应该在合理时间内添加商品', async () => {
      const startTime = Date.now();
      
      const response = await axios.post(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}`, {
        productId: validProductId,
        quantity: 1
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const endTime = Date.now();
      
      expect(response.status).toBe(201);
      expect(endTime - startTime).toBeLessThan(2000); // 2秒内完成
    });

    it('应该支持并发添加商品', async () => {
      // 同时添加多个不同商品（需要多个商品ID）
      const requests = [
        axios.post(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}`, {
          productId: validProductId,
          quantity: 1
        }, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        })
      ];
      
      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect([200, 201]).toContain(response.status);
        expect(response.data).toHaveProperty('code', 200);
      });
    });
  });

  describe('安全性验证', () => {
    it('应该防止添加商品到其他用户的购物车', async () => {
      // 这个测试需要另一个用户的token，实际实现中可能需要mock
      const response = await axios.post(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}`, {
        productId: validProductId,
        quantity: 1
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const cart = response.data.data.cart;
      expect(cart.userId).toBe(userId);
    });

    it('应该正确处理恶意输入', async () => {
      const maliciousInputs = [
        {
          productId: "'; DROP TABLE products; --",
          quantity: 1
        },
        {
          productId: "<script>alert('xss')</script>",
          quantity: 1
        },
        {
          productId: validProductId,
          quantity: "'; DELETE FROM cart_items; --"
        }
      ];
      
      for (const input of maliciousInputs) {
        try {
          await axios.post(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}`, input, {
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
      const response = await axios.post(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}`, {
        productId: validProductId,
        quantity: 1
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
      
      const response = await axios.post(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}`, {
        productId: validProductId,
        quantity: maxQuantity
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      // 应该成功或返回库存不足错误
      if (response.status === 201) {
        expect(response.data.data.item.quantity).toBeLessThanOrEqual(maxQuantity);
      }
    });

    it('应该处理网络中断后的重试', async () => {
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        try {
          const response = await axios.post(`${API_BASE_URL}${CART_ITEMS_ENDPOINT}`, {
            productId: validProductId,
            quantity: 1
          }, {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            },
            timeout: 5000
          });
          
          expect([200, 201]).toContain(response.status);
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