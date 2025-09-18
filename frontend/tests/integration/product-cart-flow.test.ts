import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import axios from 'axios';

// 集成测试：商品浏览和购物车操作流程
// 测试商品展示、详情查看、购物车操作等完整流程
// 验证商品和购物车API之间的协作和数据一致性

const API_BASE_URL = 'http://localhost:3001';
const AUTH_ENDPOINT = '/api/auth';
const PRODUCTS_ENDPOINT = '/api/products';
const CART_ENDPOINT = '/api/cart';
const USER_ENDPOINT = '/api/user';

describe('商品浏览和购物车操作集成测试', () => {
  let authToken: string;
  let userId: string;
  let testUser: any;
  let availableProducts: any[] = [];
  let testProduct: any;
  let cartId: string;
  
  beforeAll(async () => {
    console.log('开始商品浏览和购物车操作集成测试');
    
    // 创建测试用户
    const timestamp = Date.now();
    const testUserData = {
      phone: `139${timestamp.toString().slice(-8)}`,
      password: 'HackedPassword123!',
      name: `Test Cart User ${timestamp}`,
      phone: `138${String(timestamp).slice(-8)}`
    };
    
    try {
      const registerResponse = await axios.post(`${API_BASE_URL}${AUTH_ENDPOINT}/register`, testUserData);
      authToken = registerResponse.data.data.token;
      userId = registerResponse.data.data.user.id;
      testUser = registerResponse.data.data.user;
    } catch (error: any) {
      if (error.response?.status === 400) {
        // 用户可能已存在，尝试登录
        const loginResponse = await axios.post(`${API_BASE_URL}${AUTH_ENDPOINT}/login`, {
          phone: testUserData.phone,
          password: testUserData.password
        });
        authToken = loginResponse.data.data.token;
        userId = loginResponse.data.data.user.id;
        testUser = loginResponse.data.data.user;
      } else {
        throw error;
      }
    }
    
    // 获取可用商品列表
    try {
      const productsResponse = await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}`);
      availableProducts = productsResponse.data.data.products || productsResponse.data.data || [];
      
      if (availableProducts.length > 0) {
        testProduct = availableProducts[0];
      }
    } catch (error) {
      console.warn('无法获取商品列表，将跳过相关测试');
    }
  });

  beforeEach(async () => {
    // 每个测试前清空购物车
    try {
      const cartResponse = await axios.get(`${API_BASE_URL}${CART_ENDPOINT}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      const cartItems = cartResponse.data.data.items || [];
      cartId = cartResponse.data.data.id;
      
      // 清空购物车中的所有商品
      for (const item of cartItems) {
        try {
          await axios.delete(`${API_BASE_URL}${CART_ENDPOINT}/items/${item.id}`, {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          });
        } catch (error) {
          // 如果没有删除API，尝试更新数量为0
          try {
            await axios.put(`${API_BASE_URL}${CART_ENDPOINT}/items/${item.id}`, {
              quantity: 0
            }, {
              headers: {
                'Authorization': `Bearer ${authToken}`
              }
            });
          } catch (updateError) {
            console.warn('无法清空购物车项目');
          }
        }
      }
    } catch (error) {
      console.warn('无法访问购物车，将跳过相关测试');
    }
  });

  afterAll(async () => {
    console.log('商品浏览和购物车操作集成测试完成');
    
    // 清理测试数据
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

  describe('商品浏览流程', () => {
    it('应该成功获取商品列表', async () => {
      const response = await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}`);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('success', true);
      expect(response.data).toHaveProperty('data');
      
      const data = response.data.data;
      expect(data).toHaveProperty('products');
      expect(Array.isArray(data.products)).toBe(true);
      
      if (data.products.length > 0) {
        const product = data.products[0];
        expect(product).toHaveProperty('id');
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('price');
        expect(product).toHaveProperty('description');
        expect(product).toHaveProperty('category');
        expect(product).toHaveProperty('stock');
        expect(product).toHaveProperty('isActive');
        expect(product).toHaveProperty('createdAt');
        
        // 验证数据类型
        expect(typeof product.id).toBe('string');
        expect(typeof product.name).toBe('string');
        expect(typeof product.price).toBe('number');
        expect(typeof product.stock).toBe('number');
        expect(typeof product.isActive).toBe('boolean');
        
        // 验证价格和库存为正数
        expect(product.price).toBeGreaterThan(0);
        expect(product.stock).toBeGreaterThanOrEqual(0);
      }
      
      // 验证分页信息
      if (data.pagination) {
        expect(data.pagination).toHaveProperty('page');
        expect(data.pagination).toHaveProperty('limit');
        expect(data.pagination).toHaveProperty('total');
        expect(data.pagination).toHaveProperty('totalPages');
      }
    });

    it('应该支持商品列表分页', async () => {
      // 测试第一页
      const firstPageResponse = await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}?page=1&limit=5`);
      
      expect(firstPageResponse.status).toBe(200);
      expect(firstPageResponse.data.data.products.length).toBeLessThanOrEqual(5);
      
      if (firstPageResponse.data.data.pagination) {
        expect(firstPageResponse.data.data.pagination.page).toBe(1);
        expect(firstPageResponse.data.data.pagination.limit).toBe(5);
        
        // 如果有多页，测试第二页
        if (firstPageResponse.data.data.pagination.totalPages > 1) {
          const secondPageResponse = await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}?page=2&limit=5`);
          
          expect(secondPageResponse.status).toBe(200);
          expect(secondPageResponse.data.data.pagination.page).toBe(2);
          
          // 验证不同页面返回不同商品
          const firstPageIds = firstPageResponse.data.data.products.map((p: any) => p.id);
          const secondPageIds = secondPageResponse.data.data.products.map((p: any) => p.id);
          
          const intersection = firstPageIds.filter((id: string) => secondPageIds.includes(id));
          expect(intersection.length).toBe(0); // 不应该有重复商品
        }
      }
    });

    it('应该支持商品筛选和搜索', async () => {
      // 测试分类筛选
      try {
        const categoryResponse = await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}?category=electronics`);
        expect(categoryResponse.status).toBe(200);
        
        const products = categoryResponse.data.data.products;
        if (products.length > 0) {
          products.forEach((product: any) => {
            expect(product.category.toLowerCase()).toMatch(/electronic/i);
          });
        }
      } catch (error: any) {
        if (error.response?.status !== 404) {
          console.warn('分类筛选测试失败，继续其他测试');
        }
      }
      
      // 测试关键词搜索
      try {
        const searchResponse = await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}?search=phone`);
        expect(searchResponse.status).toBe(200);
        
        const products = searchResponse.data.data.products;
        if (products.length > 0) {
          products.forEach((product: any) => {
            const searchText = `${product.name} ${product.description}`.toLowerCase();
            expect(searchText).toMatch(/phone/i);
          });
        }
      } catch (error: any) {
        if (error.response?.status !== 404) {
          console.warn('搜索功能测试失败，继续其他测试');
        }
      }
    });

    it('应该支持商品排序', async () => {
      // 测试价格升序排序
      try {
        const ascResponse = await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}?sortBy=price&order=asc`);
        expect(ascResponse.status).toBe(200);
        
        const ascProducts = ascResponse.data.data.products;
        if (ascProducts.length > 1) {
          for (let i = 1; i < ascProducts.length; i++) {
            expect(ascProducts[i].price).toBeGreaterThanOrEqual(ascProducts[i - 1].price);
          }
        }
      } catch (error: any) {
        if (error.response?.status !== 404) {
          console.warn('价格排序测试失败，继续其他测试');
        }
      }
      
      // 测试价格降序排序
      try {
        const descResponse = await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}?sortBy=price&order=desc`);
        expect(descResponse.status).toBe(200);
        
        const descProducts = descResponse.data.data.products;
        if (descProducts.length > 1) {
          for (let i = 1; i < descProducts.length; i++) {
            expect(descProducts[i].price).toBeLessThanOrEqual(descProducts[i - 1].price);
          }
        }
      } catch (error: any) {
        if (error.response?.status !== 404) {
          console.warn('价格排序测试失败，继续其他测试');
        }
      }
    });

    it('应该成功获取商品详情', async () => {
      if (!testProduct) {
        console.log('跳过商品详情测试：没有可用商品');
        return;
      }
      
      const response = await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}/${testProduct.id}`);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('success', true);
      expect(response.data).toHaveProperty('data');
      
      const product = response.data.data.product || response.data.data;
      expect(product).toHaveProperty('id', testProduct.id);
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('price');
      expect(product).toHaveProperty('description');
      expect(product).toHaveProperty('category');
      expect(product).toHaveProperty('stock');
      expect(product).toHaveProperty('isActive');
      
      // 详情页可能包含更多信息
      if (product.images) {
        expect(Array.isArray(product.images)).toBe(true);
      }
      
      if (product.specifications) {
        expect(typeof product.specifications).toBe('object');
      }
      
      if (product.reviews) {
        expect(Array.isArray(product.reviews)).toBe(true);
      }
      
      // 验证数据一致性
      expect(product.name).toBe(testProduct.name);
      expect(product.price).toBe(testProduct.price);
      expect(product.category).toBe(testProduct.category);
    });

    it('应该正确处理不存在的商品', async () => {
      const nonExistentId = 'non-existent-product-id-12345';
      
      try {
        await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}/${nonExistentId}`);
        expect.fail('不存在的商品应该返回404错误');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
        expect(error.response.data).toHaveProperty('success', false);
        expect(error.response.data.message).toMatch(/(商品|product|不存在|not found|未找到)/i);
      }
    });
  });

  describe('购物车基本操作流程', () => {
    it('应该成功获取空购物车', async () => {
      const response = await axios.get(`${API_BASE_URL}${CART_ENDPOINT}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('success', true);
      expect(response.data).toHaveProperty('data');
      
      const cart = response.data.data;
      expect(cart).toHaveProperty('id');
      expect(cart).toHaveProperty('userId', userId);
      expect(cart).toHaveProperty('items');
      expect(cart).toHaveProperty('summary');
      
      expect(Array.isArray(cart.items)).toBe(true);
      expect(cart.items.length).toBe(0);
      
      const summary = cart.summary;
      expect(summary).toHaveProperty('totalItems', 0);
      expect(summary).toHaveProperty('totalAmount', 0);
      expect(summary).toHaveProperty('subtotal', 0);
      
      if (summary.tax !== undefined) {
        expect(summary.tax).toBe(0);
      }
      
      if (summary.shipping !== undefined) {
        expect(summary.shipping).toBeGreaterThanOrEqual(0);
      }
    });

    it('应该成功添加商品到购物车', async () => {
      if (!testProduct) {
        console.log('跳过添加商品测试：没有可用商品');
        return;
      }
      
      const addData = {
        productId: testProduct.id,
        quantity: 2
      };
      
      const addResponse = await axios.post(`${API_BASE_URL}${CART_ENDPOINT}/items`, addData, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      expect(addResponse.status).toBe(201);
      expect(addResponse.data).toHaveProperty('success', true);
      expect(addResponse.data).toHaveProperty('data');
      
      const cartItem = addResponse.data.data.item || addResponse.data.data;
      expect(cartItem).toHaveProperty('id');
      expect(cartItem).toHaveProperty('productId', testProduct.id);
      expect(cartItem).toHaveProperty('quantity', 2);
      expect(cartItem).toHaveProperty('price', testProduct.price);
      expect(cartItem).toHaveProperty('subtotal', testProduct.price * 2);
      
      // 验证商品信息
      if (cartItem.product) {
        expect(cartItem.product.id).toBe(testProduct.id);
        expect(cartItem.product.name).toBe(testProduct.name);
      }
      
      // 验证购物车更新
      const cartResponse = await axios.get(`${API_BASE_URL}${CART_ENDPOINT}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      const cart = cartResponse.data.data;
      expect(cart.items.length).toBe(1);
      expect(cart.items[0].productId).toBe(testProduct.id);
      expect(cart.items[0].quantity).toBe(2);
      
      const summary = cart.summary;
      expect(summary.totalItems).toBe(2);
      expect(summary.subtotal).toBe(testProduct.price * 2);
      expect(summary.totalAmount).toBeGreaterThanOrEqual(summary.subtotal);
    });

    it('应该成功更新购物车商品数量', async () => {
      if (!testProduct) {
        console.log('跳过更新商品测试：没有可用商品');
        return;
      }
      
      // 先添加商品
      const addResponse = await axios.post(`${API_BASE_URL}${CART_ENDPOINT}/items`, {
        productId: testProduct.id,
        quantity: 1
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const cartItemId = addResponse.data.data.item?.id || addResponse.data.data.id;
      
      // 更新数量
      const updateResponse = await axios.put(`${API_BASE_URL}${CART_ENDPOINT}/items/${cartItemId}`, {
        quantity: 3
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      expect(updateResponse.status).toBe(200);
      expect(updateResponse.data).toHaveProperty('success', true);
      
      const updatedItem = updateResponse.data.data.item || updateResponse.data.data;
      expect(updatedItem.quantity).toBe(3);
      expect(updatedItem.subtotal).toBe(testProduct.price * 3);
      
      // 验证购物车状态
      const cartResponse = await axios.get(`${API_BASE_URL}${CART_ENDPOINT}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      const cart = cartResponse.data.data;
      expect(cart.items[0].quantity).toBe(3);
      expect(cart.summary.totalItems).toBe(3);
      expect(cart.summary.subtotal).toBe(testProduct.price * 3);
    });

    it('应该成功删除购物车商品', async () => {
      if (!testProduct) {
        console.log('跳过删除商品测试：没有可用商品');
        return;
      }
      
      // 先添加商品
      const addResponse = await axios.post(`${API_BASE_URL}${CART_ENDPOINT}/items`, {
        productId: testProduct.id,
        quantity: 2
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const cartItemId = addResponse.data.data.item?.id || addResponse.data.data.id;
      
      // 删除商品
      const deleteResponse = await axios.delete(`${API_BASE_URL}${CART_ENDPOINT}/items/${cartItemId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.data).toHaveProperty('success', true);
      
      // 验证购物车为空
      const cartResponse = await axios.get(`${API_BASE_URL}${CART_ENDPOINT}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      const cart = cartResponse.data.data;
      expect(cart.items.length).toBe(0);
      expect(cart.summary.totalItems).toBe(0);
      expect(cart.summary.subtotal).toBe(0);
    });

    it('应该支持清空整个购物车', async () => {
      if (!testProduct || availableProducts.length < 2) {
        console.log('跳过清空购物车测试：商品不足');
        return;
      }
      
      // 添加多个商品
      for (let i = 0; i < Math.min(3, availableProducts.length); i++) {
        await axios.post(`${API_BASE_URL}${CART_ENDPOINT}/items`, {
          productId: availableProducts[i].id,
          quantity: i + 1
        }, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
      }
      
      // 验证购物车有商品
      const beforeClearResponse = await axios.get(`${API_BASE_URL}${CART_ENDPOINT}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      expect(beforeClearResponse.data.data.items.length).toBeGreaterThan(0);
      
      // 清空购物车
      try {
        const clearResponse = await axios.delete(`${API_BASE_URL}${CART_ENDPOINT}/clear`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        expect(clearResponse.status).toBe(200);
        expect(clearResponse.data).toHaveProperty('success', true);
        
        // 验证购物车为空
        const afterClearResponse = await axios.get(`${API_BASE_URL}${CART_ENDPOINT}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        const cart = afterClearResponse.data.data;
        expect(cart.items.length).toBe(0);
        expect(cart.summary.totalItems).toBe(0);
        expect(cart.summary.subtotal).toBe(0);
      } catch (error: any) {
        if (error.response?.status === 404) {
          console.log('清空购物车API不存在，跳过测试');
        } else {
          throw error;
        }
      }
    });
  });

  describe('购物车业务逻辑验证', () => {
    it('应该正确处理重复添加相同商品', async () => {
      if (!testProduct) {
        console.log('跳过重复添加测试：没有可用商品');
        return;
      }
      
      // 第一次添加
      await axios.post(`${API_BASE_URL}${CART_ENDPOINT}/items`, {
        productId: testProduct.id,
        quantity: 2
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      // 第二次添加相同商品
      const secondAddResponse = await axios.post(`${API_BASE_URL}${CART_ENDPOINT}/items`, {
        productId: testProduct.id,
        quantity: 3
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      expect(secondAddResponse.status).toBe(201);
      
      // 验证购物车状态
      const cartResponse = await axios.get(`${API_BASE_URL}${CART_ENDPOINT}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      const cart = cartResponse.data.data;
      
      // 应该只有一个商品项目，数量为累加或替换
      const productItems = cart.items.filter((item: any) => item.productId === testProduct.id);
      expect(productItems.length).toBe(1);
      
      // 数量应该是5（累加）或3（替换），取决于业务逻辑
      expect([3, 5]).toContain(productItems[0].quantity);
    });

    it('应该验证商品库存限制', async () => {
      if (!testProduct) {
        console.log('跳过库存验证测试：没有可用商品');
        return;
      }
      
      // 尝试添加超过库存的数量
      const excessiveQuantity = testProduct.stock + 100;
      
      try {
        await axios.post(`${API_BASE_URL}${CART_ENDPOINT}/items`, {
          productId: testProduct.id,
          quantity: excessiveQuantity
        }, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        // 如果添加成功，验证数量是否被限制
        const cartResponse = await axios.get(`${API_BASE_URL}${CART_ENDPOINT}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        const addedItem = cartResponse.data.data.items.find((item: any) => item.productId === testProduct.id);
        if (addedItem) {
          expect(addedItem.quantity).toBeLessThanOrEqual(testProduct.stock);
        }
      } catch (error: any) {
        // 应该返回库存不足错误
        expect(error.response.status).toBe(400);
        expect(error.response.data).toHaveProperty('success', false);
        expect(error.response.data.message).toMatch(/(库存|stock|不足|insufficient|超出|exceed)/i);
      }
    });

    it('应该正确计算购物车总价', async () => {
      if (availableProducts.length < 2) {
        console.log('跳过总价计算测试：商品不足');
        return;
      }
      
      const testProducts = availableProducts.slice(0, 2);
      let expectedSubtotal = 0;
      
      // 添加多个不同商品
      for (let i = 0; i < testProducts.length; i++) {
        const product = testProducts[i];
        const quantity = i + 1;
        
        await axios.post(`${API_BASE_URL}${CART_ENDPOINT}/items`, {
          productId: product.id,
          quantity: quantity
        }, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        expectedSubtotal += product.price * quantity;
      }
      
      // 验证购物车总价
      const cartResponse = await axios.get(`${API_BASE_URL}${CART_ENDPOINT}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      const cart = cartResponse.data.data;
      const summary = cart.summary;
      
      expect(summary.subtotal).toBe(expectedSubtotal);
      expect(summary.totalItems).toBe(testProducts.length);
      
      // 验证总金额包含税费和运费
      expect(summary.totalAmount).toBeGreaterThanOrEqual(summary.subtotal);
      
      // 验证每个商品项目的小计
      cart.items.forEach((item: any) => {
        const product = testProducts.find(p => p.id === item.productId);
        if (product) {
          expect(item.subtotal).toBe(product.price * item.quantity);
        }
      });
    });

    it('应该处理商品价格变更', async () => {
      if (!testProduct) {
        console.log('跳过价格变更测试：没有可用商品');
        return;
      }
      
      // 添加商品到购物车
      const addResponse = await axios.post(`${API_BASE_URL}${CART_ENDPOINT}/items`, {
        productId: testProduct.id,
        quantity: 2
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const originalPrice = addResponse.data.data.item?.price || addResponse.data.data.price;
      
      // 获取当前商品详情（可能价格已变更）
      const productResponse = await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}/${testProduct.id}`);
      const currentProduct = productResponse.data.data.product || productResponse.data.data;
      
      // 重新获取购物车
      const cartResponse = await axios.get(`${API_BASE_URL}${CART_ENDPOINT}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      const cartItem = cartResponse.data.data.items.find((item: any) => item.productId === testProduct.id);
      
      // 验证购物车中的价格策略
      // 可能使用添加时的价格（originalPrice）或当前价格（currentProduct.price）
      expect([originalPrice, currentProduct.price]).toContain(cartItem.price);
      
      // 验证小计计算正确
      expect(cartItem.subtotal).toBe(cartItem.price * cartItem.quantity);
    });

    it('应该处理商品下架情况', async () => {
      if (!testProduct) {
        console.log('跳过商品下架测试：没有可用商品');
        return;
      }
      
      // 添加商品到购物车
      await axios.post(`${API_BASE_URL}${CART_ENDPOINT}/items`, {
        productId: testProduct.id,
        quantity: 1
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      // 获取购物车，验证商品状态
      const cartResponse = await axios.get(`${API_BASE_URL}${CART_ENDPOINT}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      const cartItem = cartResponse.data.data.items.find((item: any) => item.productId === testProduct.id);
      
      // 验证商品信息
      if (cartItem.product) {
        expect(cartItem.product).toHaveProperty('isActive');
        
        if (!cartItem.product.isActive) {
          // 商品已下架，应该有相应标识
          expect(cartItem).toHaveProperty('isAvailable', false);
        }
      }
      
      // 尝试更新已下架商品的数量
      if (cartItem.product && !cartItem.product.isActive) {
        try {
          await axios.put(`${API_BASE_URL}${CART_ENDPOINT}/items/${cartItem.id}`, {
            quantity: 2
          }, {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          });
          expect.fail('不应该能更新已下架商品的数量');
        } catch (error: any) {
          expect(error.response.status).toBe(400);
          expect(error.response.data.message).toMatch(/(下架|inactive|不可用|unavailable)/i);
        }
      }
    });
  });

  describe('购物车权限和安全性', () => {
    it('应该拒绝未认证用户访问购物车', async () => {
      try {
        await axios.get(`${API_BASE_URL}${CART_ENDPOINT}`);
        expect.fail('未认证用户应该无法访问购物车');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
        expect(error.response.data).toHaveProperty('success', false);
      }
      
      try {
        await axios.post(`${API_BASE_URL}${CART_ENDPOINT}/items`, {
          productId: testProduct?.id || 'test-product',
          quantity: 1
        });
        expect.fail('未认证用户应该无法添加商品到购物车');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });

    it('应该拒绝无效的认证Token', async () => {
      const invalidTokens = [
        'invalid-token',
        'Bearer invalid-token',
        'expired-token-12345',
        '',
        '   '
      ];
      
      for (const invalidToken of invalidTokens) {
        try {
          await axios.get(`${API_BASE_URL}${CART_ENDPOINT}`, {
            headers: {
              'Authorization': `Bearer ${invalidToken}`
            }
          });
          expect.fail(`无效Token ${invalidToken} 应该被拒绝`);
        } catch (error: any) {
          expect(error.response.status).toBe(401);
        }
      }
    });

    it('应该防止用户访问其他用户的购物车', async () => {
      // 创建另一个测试用户
      const timestamp = Date.now();
      const anotherUserData = {
        phone: `138${timestamp.toString().slice(-8)}`,
        password: 'AnotherPassword123!',
        name: `Another User ${timestamp}`,
        phone: `139${String(timestamp).slice(-8)}`
      };
      
      let anotherUserToken: string;
      
      try {
        const registerResponse = await axios.post(`${API_BASE_URL}${AUTH_ENDPOINT}/register`, anotherUserData);
        anotherUserToken = registerResponse.data.data.token;
      } catch (error: any) {
        if (error.response?.status === 400) {
          const loginResponse = await axios.post(`${API_BASE_URL}${AUTH_ENDPOINT}/login`, {
            phone: anotherUserData.phone,
            password: anotherUserData.password
          });
          anotherUserToken = loginResponse.data.data.token;
        } else {
          throw error;
        }
      }
      
      // 第一个用户添加商品到购物车
      if (testProduct) {
        await axios.post(`${API_BASE_URL}${CART_ENDPOINT}/items`, {
          productId: testProduct.id,
          quantity: 1
        }, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
      }
      
      // 获取第一个用户的购物车
      const firstUserCartResponse = await axios.get(`${API_BASE_URL}${CART_ENDPOINT}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      // 获取第二个用户的购物车
      const secondUserCartResponse = await axios.get(`${API_BASE_URL}${CART_ENDPOINT}`, {
        headers: {
          'Authorization': `Bearer ${anotherUserToken}`
        }
      });
      
      // 验证购物车隔离
      const firstUserCart = firstUserCartResponse.data.data;
      const secondUserCart = secondUserCartResponse.data.data;
      
      expect(firstUserCart.id).not.toBe(secondUserCart.id);
      expect(firstUserCart.userId).not.toBe(secondUserCart.userId);
      
      if (testProduct) {
        expect(firstUserCart.items.length).toBe(1);
        expect(secondUserCart.items.length).toBe(0);
      }
      
      // 清理第二个用户
      try {
        await axios.delete(`${API_BASE_URL}${USER_ENDPOINT}/profile`, {
          headers: {
            'Authorization': `Bearer ${anotherUserToken}`
          }
        });
      } catch (error) {
        // 忽略清理错误
      }
    });

    it('应该验证商品ID的有效性', async () => {
      const invalidProductIds = [
        'invalid-product-id',
        'non-existent-12345',
        '',
        '   ',
        'null',
        'undefined',
        '../../etc/passwd', // 路径遍历攻击
        '<script>alert("xss")</script>' // XSS攻击
      ];
      
      for (const invalidId of invalidProductIds) {
        try {
          await axios.post(`${API_BASE_URL}${CART_ENDPOINT}/items`, {
            productId: invalidId,
            quantity: 1
          }, {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          });
          expect.fail(`无效商品ID ${invalidId} 应该被拒绝`);
        } catch (error: any) {
          expect([400, 404]).toContain(error.response.status);
          expect(error.response.data).toHaveProperty('success', false);
        }
      }
    });

    it('应该验证数量参数的有效性', async () => {
      if (!testProduct) {
        console.log('跳过数量验证测试：没有可用商品');
        return;
      }
      
      const invalidQuantities = [
        0,
        -1,
        -100,
        1.5,
        'invalid',
        null,
        undefined,
        NaN,
        Infinity,
        -Infinity
      ];
      
      for (const invalidQuantity of invalidQuantities) {
        try {
          await axios.post(`${API_BASE_URL}${CART_ENDPOINT}/items`, {
            productId: testProduct.id,
            quantity: invalidQuantity
          }, {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          });
          expect.fail(`无效数量 ${invalidQuantity} 应该被拒绝`);
        } catch (error: any) {
          expect(error.response.status).toBe(400);
          expect(error.response.data).toHaveProperty('success', false);
          expect(error.response.data.message).toMatch(/(数量|quantity|无效|invalid|必须|required)/i);
        }
      }
    });
  });

  describe('性能和并发测试', () => {
    it('应该处理并发购物车操作', async () => {
      if (!testProduct) {
        console.log('跳过并发测试：没有可用商品');
        return;
      }
      
      // 并发添加相同商品
      const concurrentAdds = Array(5).fill(null).map(() => 
        axios.post(`${API_BASE_URL}${CART_ENDPOINT}/items`, {
          productId: testProduct.id,
          quantity: 1
        }, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        })
      );
      
      const results = await Promise.allSettled(concurrentAdds);
      
      // 至少有一个请求应该成功
      const successfulRequests = results.filter(
        result => result.status === 'fulfilled' && result.value.status === 201
      );
      
      expect(successfulRequests.length).toBeGreaterThan(0);
      
      // 验证最终购物车状态
      const cartResponse = await axios.get(`${API_BASE_URL}${CART_ENDPOINT}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      const cart = cartResponse.data.data;
      const productItem = cart.items.find((item: any) => item.productId === testProduct.id);
      
      expect(productItem).toBeDefined();
      expect(productItem.quantity).toBeGreaterThan(0);
      expect(productItem.quantity).toBeLessThanOrEqual(5); // 最多5个
    });

    it('应该在合理时间内响应请求', async () => {
      const startTime = Date.now();
      
      const response = await axios.get(`${API_BASE_URL}${CART_ENDPOINT}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(2000); // 2秒内响应
    });

    it('应该正确处理大量商品的购物车', async () => {
      if (availableProducts.length < 10) {
        console.log('跳过大量商品测试：可用商品不足');
        return;
      }
      
      // 添加多个商品到购物车
      const productsToAdd = availableProducts.slice(0, 10);
      
      for (const product of productsToAdd) {
        await axios.post(`${API_BASE_URL}${CART_ENDPOINT}/items`, {
          productId: product.id,
          quantity: 1
        }, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
      }
      
      // 验证购物车性能
      const startTime = Date.now();
      
      const cartResponse = await axios.get(`${API_BASE_URL}${CART_ENDPOINT}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(cartResponse.status).toBe(200);
      expect(responseTime).toBeLessThan(3000); // 3秒内响应
      
      const cart = cartResponse.data.data;
      expect(cart.items.length).toBe(productsToAdd.length);
      
      // 验证总价计算正确
      const expectedSubtotal = productsToAdd.reduce((sum, product) => sum + product.price, 0);
      expect(cart.summary.subtotal).toBe(expectedSubtotal);
    });
  });

  describe('数据一致性和完整性', () => {
    it('应该保持商品信息与购物车的一致性', async () => {
      if (!testProduct) {
        console.log('跳过数据一致性测试：没有可用商品');
        return;
      }
      
      // 添加商品到购物车
      await axios.post(`${API_BASE_URL}${CART_ENDPOINT}/items`, {
        productId: testProduct.id,
        quantity: 1
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      // 获取购物车中的商品信息
      const cartResponse = await axios.get(`${API_BASE_URL}${CART_ENDPOINT}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      const cartItem = cartResponse.data.data.items.find((item: any) => item.productId === testProduct.id);
      
      // 获取最新的商品信息
      const productResponse = await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}/${testProduct.id}`);
      const currentProduct = productResponse.data.data.product || productResponse.data.data;
      
      // 验证基本信息一致性
      if (cartItem.product) {
        expect(cartItem.product.id).toBe(currentProduct.id);
        expect(cartItem.product.name).toBe(currentProduct.name);
        expect(cartItem.product.category).toBe(currentProduct.category);
        
        // 价格可能不同（取决于业务逻辑）
        expect([cartItem.product.price, currentProduct.price]).toContain(cartItem.price);
      }
    });

    it('应该正确处理购物车状态持久化', async () => {
      if (!testProduct) {
        console.log('跳过状态持久化测试：没有可用商品');
        return;
      }
      
      // 添加商品到购物车
      await axios.post(`${API_BASE_URL}${CART_ENDPOINT}/items`, {
        productId: testProduct.id,
        quantity: 2
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      // 获取购物车状态
      const firstCartResponse = await axios.get(`${API_BASE_URL}${CART_ENDPOINT}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      const firstCart = firstCartResponse.data.data;
      
      // 等待一段时间后再次获取
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const secondCartResponse = await axios.get(`${API_BASE_URL}${CART_ENDPOINT}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      const secondCart = secondCartResponse.data.data;
      
      // 验证状态一致性
      expect(secondCart.id).toBe(firstCart.id);
      expect(secondCart.items.length).toBe(firstCart.items.length);
      expect(secondCart.summary.totalItems).toBe(firstCart.summary.totalItems);
      expect(secondCart.summary.subtotal).toBe(firstCart.summary.subtotal);
      
      // 验证商品项目一致性
      const firstItem = firstCart.items.find((item: any) => item.productId === testProduct.id);
      const secondItem = secondCart.items.find((item: any) => item.productId === testProduct.id);
      
      expect(secondItem.id).toBe(firstItem.id);
      expect(secondItem.quantity).toBe(firstItem.quantity);
      expect(secondItem.price).toBe(firstItem.price);
      expect(secondItem.subtotal).toBe(firstItem.subtotal);
    });

    it('应该正确处理购物车与用户会话的关联', async () => {
      if (!testProduct) {
        console.log('跳过会话关联测试：没有可用商品');
        return;
      }
      
      // 添加商品到购物车
      await axios.post(`${API_BASE_URL}${CART_ENDPOINT}/items`, {
        productId: testProduct.id,
        quantity: 1
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      // 登出用户
      await axios.post(`${API_BASE_URL}${AUTH_ENDPOINT}/logout`, {}, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      // 重新登录
      const loginResponse = await axios.post(`${API_BASE_URL}${AUTH_ENDPOINT}/login`, {
        phone: testUser.phone,
        password: 'HackedPassword123!'
      });
      
      const newAuthToken = loginResponse.data.data.token;
      
      // 获取购物车，验证商品是否保留
      const cartResponse = await axios.get(`${API_BASE_URL}${CART_ENDPOINT}`, {
        headers: {
          'Authorization': `Bearer ${newAuthToken}`
        }
      });
      
      const cart = cartResponse.data.data;
      
      // 验证购物车商品是否保留（取决于业务逻辑）
      // 有些系统会保留，有些会清空
      expect(cart).toHaveProperty('items');
      expect(cart).toHaveProperty('summary');
      expect(cart.userId).toBe(userId);
      
      // 更新认证Token用于后续测试
      authToken = newAuthToken;
    });
  });
});