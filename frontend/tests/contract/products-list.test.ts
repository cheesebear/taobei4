import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import axios from 'axios';

// API合约测试：商品列表接口
// 测试 GET /api/products 接口
// 验证分页、筛选、排序参数

const API_BASE_URL = 'http://localhost:3001';
const PRODUCTS_ENDPOINT = '/api/products';

describe('商品列表API合约测试', () => {
  beforeAll(async () => {
    console.log('开始商品列表API合约测试');
  });

  afterAll(async () => {
    console.log('商品列表API合约测试完成');
  });

  describe('基本商品列表获取', () => {
    it('应该成功获取商品列表', async () => {
      const response = await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}`);

      // 验证响应状态码
      expect(response.status).toBe(200);

      // 验证响应数据结构
      expect(response.data).toHaveProperty('code', 200);
      expect(response.data).toHaveProperty('data');
      expect(response.data.data).toHaveProperty('data');
      expect(response.data.data.data).toHaveProperty('products');
      expect(response.data.data.data).toHaveProperty('pagination');
      expect(response.data.data.data).toHaveProperty('filters');
      expect(response.data.data.data).toHaveProperty('sorting');

      // 验证商品数组
      expect(Array.isArray(response.data.data.data.products)).toBe(true);
      expect(response.data.data.data.products.length).toBeGreaterThan(0);

      // 验证单个商品数据结构
      const product = response.data.data.data.products[0];
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('title');
      expect(product).toHaveProperty('price');
      expect(product).toHaveProperty('originalPrice');
      expect(product).toHaveProperty('image');
      expect(product).toHaveProperty('images');
      expect(product).toHaveProperty('category');
      expect(product).toHaveProperty('brand');
      expect(product).toHaveProperty('rating');
      expect(product).toHaveProperty('reviewCount');
      expect(product).toHaveProperty('sales');
      expect(product).toHaveProperty('stock');
      expect(product).toHaveProperty('tags');
      expect(product).toHaveProperty('createdAt');
      expect(product).toHaveProperty('updatedAt');

      // 验证数据类型
      expect(typeof product.id).toBe('string');
      expect(typeof product.title).toBe('string');
      expect(typeof product.price).toBe('number');
      expect(typeof product.originalPrice).toBe('number');
      expect(typeof product.image).toBe('string');
      expect(Array.isArray(product.images)).toBe(true);
      expect(typeof product.category).toBe('string');
      expect(typeof product.brand).toBe('string');
      expect(typeof product.rating).toBe('number');
      expect(typeof product.reviewCount).toBe('number');
      expect(typeof product.sales).toBe('number');
      expect(typeof product.stock).toBe('number');
      expect(Array.isArray(product.tags)).toBe(true);
      expect(typeof product.createdAt).toBe('string');
      expect(typeof product.updatedAt).toBe('string');

      // 验证分页信息
      const pagination = response.data.data.data.pagination;
      expect(pagination).toHaveProperty('page');
      expect(pagination).toHaveProperty('limit');
      expect(pagination).toHaveProperty('total');
      expect(pagination).toHaveProperty('totalPages');
      expect(pagination).toHaveProperty('hasNext');
      expect(pagination).toHaveProperty('hasPrev');

      expect(typeof pagination.page).toBe('number');
      expect(typeof pagination.limit).toBe('number');
      expect(typeof pagination.total).toBe('number');
      expect(typeof pagination.totalPages).toBe('number');
      expect(typeof pagination.hasNext).toBe('boolean');
      expect(typeof pagination.hasPrev).toBe('boolean');
    });
  });

  describe('分页参数验证', () => {
    it('应该支持页码参数', async () => {
      const response = await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}?page=2`);

      expect(response.status).toBe(200);
      expect(response.data.data.data.pagination.page).toBe(2);
    });

    it('应该支持每页数量参数', async () => {
      const response = await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}?limit=5`);

      expect(response.status).toBe(200);
      expect(response.data.data.data.pagination.limit).toBe(5);
      expect(response.data.data.data.products.length).toBeLessThanOrEqual(5);
    });

    it('应该支持同时使用页码和每页数量参数', async () => {
      const response = await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}?page=2&limit=10`);

      expect(response.status).toBe(200);
      expect(response.data.data.data.pagination.page).toBe(2);
      expect(response.data.data.data.pagination.limit).toBe(10);
    });

    it('应该拒绝无效的页码参数', async () => {
      const invalidPages = [0, -1, 'invalid', 1.5];

      for (const page of invalidPages) {
        try {
          await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}?page=${page}`);
          expect.fail(`页码 ${page} 应该被拒绝`);
        } catch (error: any) {
          expect(error.response.status).toBe(400);
          expect(error.response.data).toHaveProperty('code', 400);
          expect(error.response.data.message).toContain('页码');
        }
      }
    });

    it('应该拒绝无效的每页数量参数', async () => {
      const invalidLimits = [0, -1, 101, 'invalid', 1.5]; // 假设最大限制是100

      for (const limit of invalidLimits) {
        try {
          await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}?limit=${limit}`);
          expect.fail(`每页数量 ${limit} 应该被拒绝`);
        } catch (error: any) {
          expect(error.response.status).toBe(400);
          expect(error.response.data).toHaveProperty('code', 400);
          expect(error.response.data.message).toContain('每页数量');
        }
      }
    });

    it('应该处理超出范围的页码', async () => {
      const response = await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}?page=999999`);

      expect(response.status).toBe(200);
      expect(response.data.data.data.products).toHaveLength(0);
      expect(response.data.data.data.pagination.page).toBe(999999);
      expect(response.data.data.data.pagination.hasNext).toBe(false);
    });
  });

  describe('筛选参数验证', () => {
    it('应该支持按分类筛选', async () => {
      const response = await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}?category=electronics`);

      expect(response.status).toBe(200);
      expect(response.data.data.data.products.every((product: any) => 
        product.category === 'electronics'
      )).toBe(true);
    });

    it('应该支持按品牌筛选', async () => {
      const response = await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}?brand=Apple`);

      expect(response.status).toBe(200);
      expect(response.data.data.data.products.every((product: any) => 
        product.brand === 'Apple'
      )).toBe(true);
    });

    it('应该支持按价格区间筛选', async () => {
      const response = await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}?minPrice=100&maxPrice=500`);

      expect(response.status).toBe(200);
      expect(response.data.data.data.products.every((product: any) => 
        product.price >= 100 && product.price <= 500
      )).toBe(true);
    });

    it('应该支持按评分筛选', async () => {
      const response = await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}?minRating=4`);

      expect(response.status).toBe(200);
      expect(response.data.data.data.products.every((product: any) => 
        product.rating >= 4
      )).toBe(true);
    });

    it('应该支持按库存状态筛选', async () => {
      const response = await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}?inStock=true`);

      expect(response.status).toBe(200);
      expect(response.data.data.data.products.every((product: any) => 
        product.stock > 0
      )).toBe(true);
    });

    it('应该支持按标签筛选', async () => {
      const response = await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}?tags=hot,new`);

      expect(response.status).toBe(200);
      expect(response.data.data.data.products.every((product: any) => 
        product.tags.some((tag: string) => ['hot', 'new'].includes(tag))
      )).toBe(true);
    });

    it('应该支持关键词搜索', async () => {
      const response = await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}?keyword=iPhone`);

      expect(response.status).toBe(200);
      expect(response.data.data.data.products.every((product: any) => 
        product.title.toLowerCase().includes('iphone') ||
        product.brand.toLowerCase().includes('iphone') ||
        product.tags.some((tag: string) => tag.toLowerCase().includes('iphone'))
      )).toBe(true);
    });

    it('应该支持多个筛选条件组合', async () => {
      const response = await axios.get(
        `${API_BASE_URL}${PRODUCTS_ENDPOINT}?category=electronics&brand=Apple&minPrice=500&inStock=true`
      );

      expect(response.status).toBe(200);
      expect(response.data.data.data.products.every((product: any) => 
        product.category === 'electronics' &&
        product.brand === 'Apple' &&
        product.price >= 500 &&
        product.stock > 0
      )).toBe(true);
    });

    it('应该拒绝无效的价格区间', async () => {
      try {
        await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}?minPrice=500&maxPrice=100`);
        expect.fail('应该抛出错误');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toHaveProperty('code', 400);
        expect(error.response.data.message).toContain('价格区间');
      }
    });

    it('应该拒绝无效的评分值', async () => {
      const invalidRatings = [-1, 6, 'invalid', 1.5];

      for (const rating of invalidRatings) {
        try {
          await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}?minRating=${rating}`);
          expect.fail(`评分 ${rating} 应该被拒绝`);
        } catch (error: any) {
          expect(error.response.status).toBe(400);
          expect(error.response.data).toHaveProperty('code', 400);
          expect(error.response.data.message).toContain('评分');
        }
      }
    });
  });

  describe('排序参数验证', () => {
    it('应该支持按价格升序排序', async () => {
      const response = await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}?sortBy=price&sortOrder=asc`);

      expect(response.status).toBe(200);
      const products = response.data.data.data.products;
      for (let i = 1; i < products.length; i++) {
        expect(products[i].price).toBeGreaterThanOrEqual(products[i - 1].price);
      }
    });

    it('应该支持按价格降序排序', async () => {
      const response = await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}?sortBy=price&sortOrder=desc`);

      expect(response.status).toBe(200);
      const products = response.data.data.data.products;
      for (let i = 1; i < products.length; i++) {
        expect(products[i].price).toBeLessThanOrEqual(products[i - 1].price);
      }
    });

    it('应该支持按销量排序', async () => {
      const response = await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}?sortBy=sales&sortOrder=desc`);

      expect(response.status).toBe(200);
      const products = response.data.data.data.products;
      for (let i = 1; i < products.length; i++) {
        expect(products[i].sales).toBeLessThanOrEqual(products[i - 1].sales);
      }
    });

    it('应该支持按评分排序', async () => {
      const response = await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}?sortBy=rating&sortOrder=desc`);

      expect(response.status).toBe(200);
      const products = response.data.data.data.products;
      for (let i = 1; i < products.length; i++) {
        expect(products[i].rating).toBeLessThanOrEqual(products[i - 1].rating);
      }
    });

    it('应该支持按创建时间排序', async () => {
      const response = await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}?sortBy=createdAt&sortOrder=desc`);

      expect(response.status).toBe(200);
      const products = response.data.data.data.products;
      for (let i = 1; i < products.length; i++) {
        expect(new Date(products[i].createdAt).getTime())
          .toBeLessThanOrEqual(new Date(products[i - 1].createdAt).getTime());
      }
    });

    it('应该拒绝无效的排序字段', async () => {
      const invalidSortFields = ['invalid', 'password', 'secret'];

      for (const sortBy of invalidSortFields) {
        try {
          await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}?sortBy=${sortBy}`);
          expect.fail(`排序字段 ${sortBy} 应该被拒绝`);
        } catch (error: any) {
          expect(error.response.status).toBe(400);
          expect(error.response.data).toHaveProperty('code', 400);
          expect(error.response.data.message).toContain('排序字段');
        }
      }
    });

    it('应该拒绝无效的排序方向', async () => {
      const invalidSortOrders = ['invalid', 'ascending', 'descending'];

      for (const sortOrder of invalidSortOrders) {
        try {
          await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}?sortBy=price&sortOrder=${sortOrder}`);
          expect.fail(`排序方向 ${sortOrder} 应该被拒绝`);
        } catch (error: any) {
          expect(error.response.status).toBe(400);
          expect(error.response.data).toHaveProperty('code', 400);
          expect(error.response.data.message).toContain('排序方向');
        }
      }
    });

    it('应该在只提供sortBy时使用默认排序方向', async () => {
      const response = await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}?sortBy=price`);

      expect(response.status).toBe(200);
      expect(response.data.data.data.sorting).toHaveProperty('sortBy', 'price');
      expect(response.data.data.data.sorting).toHaveProperty('sortOrder');
      expect(['asc', 'desc']).toContain(response.data.data.data.sorting.sortOrder);
    });
  });

  describe('响应头验证', () => {
    it('应该返回正确的Content-Type', async () => {
      const response = await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}`);
      
      expect(response.headers['content-type']).toContain('application/json');
    });

    it('应该包含缓存相关的响应头', async () => {
      const response = await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}`);
      
      // 检查缓存相关的响应头
      expect(response.headers).toHaveProperty('cache-control');
      expect(response.headers).toHaveProperty('etag');
    });
  });

  describe('性能验证', () => {
    it('应该在合理时间内返回结果', async () => {
      const startTime = Date.now();
      const response = await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}`);
      const endTime = Date.now();
      
      expect(response.status).toBe(200);
      expect(endTime - startTime).toBeLessThan(2000); // 2秒内返回
    });

    it('应该支持大量数据的分页查询', async () => {
      const response = await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}?limit=100`);
      
      expect(response.status).toBe(200);
      expect(response.data.data.data.products.length).toBeLessThanOrEqual(100);
    });
  });

  describe('边界条件验证', () => {
    it('应该处理空结果集', async () => {
      const response = await axios.get(
        `${API_BASE_URL}${PRODUCTS_ENDPOINT}?keyword=nonexistentproduct12345`
      );

      expect(response.status).toBe(200);
      expect(response.data.data.data.products).toHaveLength(0);
      expect(response.data.data.data.pagination.total).toBe(0);
      expect(response.data.data.data.pagination.totalPages).toBe(0);
    });

    it('应该处理特殊字符的搜索', async () => {
      const specialChars = ['@', '#', '$', '%', '&', '*', '(', ')', '+', '='];
      
      for (const char of specialChars) {
        const response = await axios.get(
          `${API_BASE_URL}${PRODUCTS_ENDPOINT}?keyword=${encodeURIComponent(char)}`
        );
        
        expect(response.status).toBe(200);
        // 应该返回空结果或相关结果，不应该报错
      }
    });
  });
});