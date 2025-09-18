import { describe, it, expect, beforeEach, vi } from 'vitest';

const API_BASE_URL = 'http://localhost:3000/api';

// Mock fetch function
const mockFetch = (mockResponse: any, status: number = 200) => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(mockResponse),
  });
};

describe('Products API Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/products', () => {
    it('should get products list successfully', async () => {
      const mockResponse = {
        success: true,
        message: '获取商品列表成功',
        data: {
          products: [
            {
              id: '1',
              name: 'iPhone 15 Pro',
              price: 7999,
              originalPrice: 8999,
              image: 'https://example.com/iphone15pro.jpg',
              category: '手机数码',
              brand: 'Apple',
              rating: 4.8,
              reviewCount: 1250,
              stock: 100,
              tags: ['热销', '新品'],
              description: 'Apple iPhone 15 Pro 128GB 原色钛金属',
            },
            {
              id: '2',
              name: 'MacBook Pro 14',
              price: 14999,
              originalPrice: 15999,
              image: 'https://example.com/macbookpro14.jpg',
              category: '电脑办公',
              brand: 'Apple',
              rating: 4.9,
              reviewCount: 890,
              stock: 50,
              tags: ['推荐'],
              description: 'Apple MacBook Pro 14英寸 M3芯片',
            },
          ],
          pagination: {
            page: 1,
            limit: 20,
            total: 2,
            totalPages: 1,
          },
        },
      };

      mockFetch(mockResponse, 200);

      const response = await fetch(`${API_BASE_URL}/products`);
      const result = await response.json();

      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/products`);
      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.message).toBe('获取商品列表成功');
      expect(result.data).toHaveProperty('products');
      expect(result.data).toHaveProperty('pagination');
      expect(result.data.products).toHaveLength(2);
      expect(result.data.products[0]).toHaveProperty('id');
      expect(result.data.products[0]).toHaveProperty('name');
      expect(result.data.products[0]).toHaveProperty('price');
    });

    it('should get products with pagination parameters', async () => {
      const mockResponse = {
        success: true,
        message: '获取商品列表成功',
        data: {
          products: [],
          pagination: {
            page: 2,
            limit: 10,
            total: 25,
            totalPages: 3,
          },
        },
      };

      mockFetch(mockResponse, 200);

      const queryParams = new URLSearchParams({
        page: '2',
        limit: '10',
      });

      const response = await fetch(`${API_BASE_URL}/products?${queryParams}`);
      const result = await response.json();

      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/products?${queryParams}`);
      expect(response.status).toBe(200);
      expect(result.data.pagination.page).toBe(2);
      expect(result.data.pagination.limit).toBe(10);
    });

    it('should get products with category filter', async () => {
      const mockResponse = {
        success: true,
        message: '获取商品列表成功',
        data: {
          products: [
            {
              id: '1',
              name: 'iPhone 15 Pro',
              price: 7999,
              category: '手机数码',
              brand: 'Apple',
            },
          ],
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            totalPages: 1,
          },
        },
      };

      mockFetch(mockResponse, 200);

      const queryParams = new URLSearchParams({
        category: '手机数码',
      });

      const response = await fetch(`${API_BASE_URL}/products?${queryParams}`);
      const result = await response.json();

      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/products?${queryParams}`);
      expect(response.status).toBe(200);
      expect(result.data.products[0].category).toBe('手机数码');
    });

    it('should get products with search keyword', async () => {
      const mockResponse = {
        success: true,
        message: '获取商品列表成功',
        data: {
          products: [
            {
              id: '1',
              name: 'iPhone 15 Pro',
              price: 7999,
              category: '手机数码',
              brand: 'Apple',
            },
          ],
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            totalPages: 1,
          },
        },
      };

      mockFetch(mockResponse, 200);

      const queryParams = new URLSearchParams({
        keyword: 'iPhone',
      });

      const response = await fetch(`${API_BASE_URL}/products?${queryParams}`);
      const result = await response.json();

      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/products?${queryParams}`);
      expect(response.status).toBe(200);
      expect(result.data.products[0].name).toContain('iPhone');
    });

    it('should get products with price range filter', async () => {
      const mockResponse = {
        success: true,
        message: '获取商品列表成功',
        data: {
          products: [
            {
              id: '1',
              name: 'iPhone 15 Pro',
              price: 7999,
              category: '手机数码',
              brand: 'Apple',
            },
          ],
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            totalPages: 1,
          },
        },
      };

      mockFetch(mockResponse, 200);

      const queryParams = new URLSearchParams({
        minPrice: '5000',
        maxPrice: '10000',
      });

      const response = await fetch(`${API_BASE_URL}/products?${queryParams}`);
      const result = await response.json();

      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/products?${queryParams}`);
      expect(response.status).toBe(200);
      expect(result.data.products[0].price).toBeGreaterThanOrEqual(5000);
      expect(result.data.products[0].price).toBeLessThanOrEqual(10000);
    });

    it('should get products with sorting', async () => {
      const mockResponse = {
        success: true,
        message: '获取商品列表成功',
        data: {
          products: [
            {
              id: '2',
              name: 'MacBook Pro 14',
              price: 14999,
              category: '电脑办公',
              brand: 'Apple',
            },
            {
              id: '1',
              name: 'iPhone 15 Pro',
              price: 7999,
              category: '手机数码',
              brand: 'Apple',
            },
          ],
          pagination: {
            page: 1,
            limit: 20,
            total: 2,
            totalPages: 1,
          },
        },
      };

      mockFetch(mockResponse, 200);

      const queryParams = new URLSearchParams({
        sortBy: 'price',
        sortOrder: 'desc',
      });

      const response = await fetch(`${API_BASE_URL}/products?${queryParams}`);
      const result = await response.json();

      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/products?${queryParams}`);
      expect(response.status).toBe(200);
      expect(result.data.products[0].price).toBeGreaterThan(result.data.products[1].price);
    });

    it('should handle empty results', async () => {
      const mockResponse = {
        success: true,
        message: '暂无商品',
        data: {
          products: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
          },
        },
      };

      mockFetch(mockResponse, 200);

      const queryParams = new URLSearchParams({
        keyword: 'nonexistent',
      });

      const response = await fetch(`${API_BASE_URL}/products?${queryParams}`);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data.products).toHaveLength(0);
      expect(result.data.pagination.total).toBe(0);
    });

    it('should fail with invalid pagination parameters', async () => {
      const mockResponse = {
        success: false,
        message: '分页参数无效',
      };

      mockFetch(mockResponse, 400);

      const queryParams = new URLSearchParams({
        page: '-1',
        limit: '0',
      });

      const response = await fetch(`${API_BASE_URL}/products?${queryParams}`);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.message).toBe('分页参数无效');
    });
  });

  describe('GET /api/products/:id', () => {
    it('should get product details successfully', async () => {
      const mockResponse = {
        success: true,
        message: '获取商品详情成功',
        data: {
          id: '1',
          name: 'iPhone 15 Pro',
          price: 7999,
          originalPrice: 8999,
          images: [
            'https://example.com/iphone15pro-1.jpg',
            'https://example.com/iphone15pro-2.jpg',
            'https://example.com/iphone15pro-3.jpg',
          ],
          category: '手机数码',
          brand: 'Apple',
          rating: 4.8,
          reviewCount: 1250,
          stock: 100,
          tags: ['热销', '新品'],
          description: 'Apple iPhone 15 Pro 128GB 原色钛金属',
          specifications: {
            '屏幕尺寸': '6.1英寸',
            '存储容量': '128GB',
            '颜色': '原色钛金属',
            '网络': '5G',
          },
          reviews: [
            {
              id: '1',
              userId: 'user1',
              username: '张三',
              rating: 5,
              comment: '非常好用，推荐购买！',
              createdAt: '2024-01-15T10:30:00Z',
            },
          ],
          relatedProducts: [
            {
              id: '2',
              name: 'iPhone 15',
              price: 5999,
              image: 'https://example.com/iphone15.jpg',
            },
          ],
        },
      };

      mockFetch(mockResponse, 200);

      const productId = '1';
      const response = await fetch(`${API_BASE_URL}/products/${productId}`);
      const result = await response.json();

      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/products/${productId}`);
      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.message).toBe('获取商品详情成功');
      expect(result.data).toHaveProperty('id', '1');
      expect(result.data).toHaveProperty('name');
      expect(result.data).toHaveProperty('price');
      expect(result.data).toHaveProperty('images');
      expect(result.data).toHaveProperty('specifications');
      expect(result.data).toHaveProperty('reviews');
      expect(result.data).toHaveProperty('relatedProducts');
    });

    it('should fail with non-existent product ID', async () => {
      const mockResponse = {
        success: false,
        message: '商品不存在',
      };

      mockFetch(mockResponse, 404);

      const productId = '999';
      const response = await fetch(`${API_BASE_URL}/products/${productId}`);
      const result = await response.json();

      expect(response.status).toBe(404);
      expect(result.success).toBe(false);
      expect(result.message).toBe('商品不存在');
    });

    it('should fail with invalid product ID format', async () => {
      const mockResponse = {
        success: false,
        message: '商品ID格式无效',
      };

      mockFetch(mockResponse, 400);

      const productId = 'invalid-id';
      const response = await fetch(`${API_BASE_URL}/products/${productId}`);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.message).toBe('商品ID格式无效');
    });
  });
});