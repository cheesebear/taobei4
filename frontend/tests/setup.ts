import { beforeAll, afterAll } from 'vitest';
import axios from 'axios';

// 测试环境配置
const API_BASE_URL = 'http://localhost:3001';
const FRONTEND_BASE_URL = 'http://localhost:5173';

// 全局测试配置
beforeAll(async () => {
  console.log('开始测试环境初始化...');
  
  // 检查后端服务是否可用
  try {
    const healthResponse = await axios.get(`${API_BASE_URL}/health`, {
      timeout: 5000
    });
    console.log('后端服务状态:', healthResponse.status === 200 ? '正常' : '异常');
  } catch (error) {
    console.warn('后端服务不可用，某些测试可能会失败');
    console.warn('请确保后端服务在 http://localhost:3001 运行');
  }
  
  // 检查前端服务是否可用
  try {
    const frontendResponse = await axios.get(FRONTEND_BASE_URL, {
      timeout: 5000
    });
    console.log('前端服务状态:', frontendResponse.status === 200 ? '正常' : '异常');
  } catch (error) {
    console.warn('前端服务不可用，某些集成测试可能会失败');
    console.warn('请确保前端服务在 http://localhost:5173 运行');
  }
  
  // 设置全局axios配置
  axios.defaults.timeout = 10000;
  axios.defaults.headers.common['Content-Type'] = 'application/json';
  
  // 添加请求拦截器用于调试
  axios.interceptors.request.use(
    (config) => {
      if (process.env.NODE_ENV === 'test' && process.env.DEBUG_API) {
        console.log(`API请求: ${config.method?.toUpperCase()} ${config.url}`);
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  
  // 添加响应拦截器用于调试
  axios.interceptors.response.use(
    (response) => {
      if (process.env.NODE_ENV === 'test' && process.env.DEBUG_API) {
        console.log(`API响应: ${response.status} ${response.config.url}`);
      }
      return response;
    },
    (error) => {
      if (process.env.NODE_ENV === 'test' && process.env.DEBUG_API) {
        console.log(`API错误: ${error.response?.status} ${error.config?.url}`);
      }
      return Promise.reject(error);
    }
  );
  
  console.log('测试环境初始化完成');
});

afterAll(async () => {
  console.log('测试环境清理完成');
});

// 导出测试工具函数
export const testUtils = {
  API_BASE_URL,
  FRONTEND_BASE_URL,
  
  // 生成随机测试数据
  generateTestUser: () => {
    const timestamp = Date.now();
    return {
      email: `test.user.${timestamp}@example.com`,
      password: 'HackedPassword123!',
      name: `Test User ${timestamp}`,
      phone: `138${String(timestamp).slice(-8)}`
    };
  },
  
  // 等待函数
  wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // 重试函数
  retry: async <T>(fn: () => Promise<T>, maxAttempts: number = 3, delay: number = 1000): Promise<T> => {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxAttempts) {
          throw lastError;
        }
        
        console.log(`尝试 ${attempt} 失败，${delay}ms 后重试...`);
        await testUtils.wait(delay);
      }
    }
    
    throw lastError!;
  },
  
  // 清理测试用户
  cleanupTestUser: async (authToken: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/user/profile`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
    } catch (error) {
      // 忽略清理错误
      console.warn('清理测试用户失败:', error);
    }
  },
  
  // 验证API响应格式
  validateApiResponse: (response: any, expectedData?: string[]) => {
    expect(response).toHaveProperty('success');
    expect(response).toHaveProperty('data');
    
    if (response.success === false) {
      expect(response).toHaveProperty('message');
      expect(typeof response.message).toBe('string');
    }
    
    if (expectedData && response.success === true) {
      expectedData.forEach(field => {
        expect(response.data).toHaveProperty(field);
      });
    }
    
    return response;
  },
  
  // 验证分页响应
  validatePaginationResponse: (response: any) => {
    testUtils.validateApiResponse(response);
    
    if (response.data.pagination) {
      const pagination = response.data.pagination;
      expect(pagination).toHaveProperty('page');
      expect(pagination).toHaveProperty('limit');
      expect(pagination).toHaveProperty('total');
      expect(pagination).toHaveProperty('totalPages');
      
      expect(typeof pagination.page).toBe('number');
      expect(typeof pagination.limit).toBe('number');
      expect(typeof pagination.total).toBe('number');
      expect(typeof pagination.totalPages).toBe('number');
      
      expect(pagination.page).toBeGreaterThan(0);
      expect(pagination.limit).toBeGreaterThan(0);
      expect(pagination.total).toBeGreaterThanOrEqual(0);
      expect(pagination.totalPages).toBeGreaterThanOrEqual(0);
    }
    
    return response;
  },
  
  // 验证商品数据结构
  validateProductData: (product: any) => {
    expect(product).toHaveProperty('id');
    expect(product).toHaveProperty('name');
    expect(product).toHaveProperty('price');
    expect(product).toHaveProperty('description');
    expect(product).toHaveProperty('category');
    expect(product).toHaveProperty('stock');
    expect(product).toHaveProperty('isActive');
    expect(product).toHaveProperty('createdAt');
    
    expect(typeof product.id).toBe('string');
    expect(typeof product.name).toBe('string');
    expect(typeof product.price).toBe('number');
    expect(typeof product.description).toBe('string');
    expect(typeof product.category).toBe('string');
    expect(typeof product.stock).toBe('number');
    expect(typeof product.isActive).toBe('boolean');
    
    expect(product.price).toBeGreaterThan(0);
    expect(product.stock).toBeGreaterThanOrEqual(0);
    expect(product.name.trim()).not.toBe('');
    expect(product.category.trim()).not.toBe('');
    
    return product;
  },
  
  // 验证用户数据结构
  validateUserData: (user: any) => {
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('name');
    expect(user).toHaveProperty('createdAt');
    
    expect(typeof user.id).toBe('string');
    expect(typeof user.email).toBe('string');
    expect(typeof user.name).toBe('string');
    
    expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    expect(user.name.trim()).not.toBe('');
    
    // 不应该包含敏感信息
    expect(user).not.toHaveProperty('password');
    expect(user).not.toHaveProperty('passwordHash');
    
    return user;
  },
  
  // 验证购物车数据结构
  validateCartData: (cart: any) => {
    expect(cart).toHaveProperty('id');
    expect(cart).toHaveProperty('userId');
    expect(cart).toHaveProperty('items');
    expect(cart).toHaveProperty('summary');
    
    expect(typeof cart.id).toBe('string');
    expect(typeof cart.userId).toBe('string');
    expect(Array.isArray(cart.items)).toBe(true);
    expect(typeof cart.summary).toBe('object');
    
    // 验证摘要信息
    const summary = cart.summary;
    expect(summary).toHaveProperty('totalItems');
    expect(summary).toHaveProperty('subtotal');
    expect(summary).toHaveProperty('totalAmount');
    
    expect(typeof summary.totalItems).toBe('number');
    expect(typeof summary.subtotal).toBe('number');
    expect(typeof summary.totalAmount).toBe('number');
    
    expect(summary.totalItems).toBeGreaterThanOrEqual(0);
    expect(summary.subtotal).toBeGreaterThanOrEqual(0);
    expect(summary.totalAmount).toBeGreaterThanOrEqual(summary.subtotal);
    
    // 验证购物车项目
    cart.items.forEach((item: any) => {
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('productId');
      expect(item).toHaveProperty('quantity');
      expect(item).toHaveProperty('price');
      expect(item).toHaveProperty('subtotal');
      
      expect(typeof item.id).toBe('string');
      expect(typeof item.productId).toBe('string');
      expect(typeof item.quantity).toBe('number');
      expect(typeof item.price).toBe('number');
      expect(typeof item.subtotal).toBe('number');
      
      expect(item.quantity).toBeGreaterThan(0);
      expect(item.price).toBeGreaterThan(0);
      expect(item.subtotal).toBe(item.price * item.quantity);
    });
    
    return cart;
  },
  
  // 验证认证Token
  validateAuthToken: (token: string) => {
    expect(typeof token).toBe('string');
    expect(token.trim()).not.toBe('');
    expect(token.length).toBeGreaterThan(10);
    
    return token;
  },
  
  // 验证错误响应
  validateErrorResponse: (error: any, expectedStatus?: number) => {
    expect(error.response).toBeDefined();
    expect(error.response.data).toHaveProperty('success', false);
    expect(error.response.data).toHaveProperty('message');
    expect(typeof error.response.data.message).toBe('string');
    
    if (expectedStatus) {
      expect(error.response.status).toBe(expectedStatus);
    }
    
    return error.response.data;
  }
};

// 导出常用的测试断言
export { expect } from 'vitest';