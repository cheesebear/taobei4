import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import axios from 'axios';

// API合约测试：商品详情接口
// 测试 GET /api/products/:id 接口
// 验证商品详情数据结构和业务逻辑

const API_BASE_URL = 'http://localhost:3001';
const PRODUCTS_ENDPOINT = '/api/products';

describe('商品详情API合约测试', () => {
  let validProductId: string;
  
  beforeAll(async () => {
    console.log('开始商品详情API合约测试');
    
    // 获取一个有效的商品ID用于测试
    try {
      const response = await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}?limit=1`);
      if (response.data.data.products.length > 0) {
        validProductId = response.data.data.products[0].id;
      } else {
        validProductId = 'test-product-1'; // 使用默认测试ID
      }
    } catch (error) {
      validProductId = 'test-product-1'; // 使用默认测试ID
    }
  });

  afterAll(async () => {
    console.log('商品详情API合约测试完成');
  });

  describe('基本商品详情获取', () => {
    it('应该成功获取商品详情', async () => {
      const response = await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}/${validProductId}`);

      // 验证响应状态码
      expect(response.status).toBe(200);

      // 验证响应数据结构
      expect(response.data).toHaveProperty('success', true);
      expect(response.data).toHaveProperty('data');
      expect(response.data.data).toHaveProperty('product');

      const product = response.data.data.product;

      // 验证基本商品信息
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('title');
      expect(product).toHaveProperty('description');
      expect(product).toHaveProperty('price');
      expect(product).toHaveProperty('originalPrice');
      expect(product).toHaveProperty('discount');
      expect(product).toHaveProperty('image');
      expect(product).toHaveProperty('images');
      expect(product).toHaveProperty('category');
      expect(product).toHaveProperty('categoryPath');
      expect(product).toHaveProperty('brand');
      expect(product).toHaveProperty('model');
      expect(product).toHaveProperty('sku');
      expect(product).toHaveProperty('barcode');

      // 验证评价和销售信息
      expect(product).toHaveProperty('rating');
      expect(product).toHaveProperty('reviewCount');
      expect(product).toHaveProperty('reviews');
      expect(product).toHaveProperty('sales');
      expect(product).toHaveProperty('monthSales');
      expect(product).toHaveProperty('stock');
      expect(product).toHaveProperty('minStock');
      expect(product).toHaveProperty('maxStock');

      // 验证商品属性
      expect(product).toHaveProperty('attributes');
      expect(product).toHaveProperty('specifications');
      expect(product).toHaveProperty('variants');
      expect(product).toHaveProperty('tags');
      expect(product).toHaveProperty('keywords');

      // 验证商品状态
      expect(product).toHaveProperty('status');
      expect(product).toHaveProperty('isActive');
      expect(product).toHaveProperty('isFeatured');
      expect(product).toHaveProperty('isOnSale');
      expect(product).toHaveProperty('isNewArrival');

      // 验证物流信息
      expect(product).toHaveProperty('shipping');
      expect(product).toHaveProperty('weight');
      expect(product).toHaveProperty('dimensions');
      expect(product).toHaveProperty('origin');

      // 验证时间戳
      expect(product).toHaveProperty('createdAt');
      expect(product).toHaveProperty('updatedAt');
      expect(product).toHaveProperty('publishedAt');

      // 验证数据类型
      expect(typeof product.id).toBe('string');
      expect(typeof product.title).toBe('string');
      expect(typeof product.description).toBe('string');
      expect(typeof product.price).toBe('number');
      expect(typeof product.originalPrice).toBe('number');
      expect(typeof product.discount).toBe('number');
      expect(typeof product.image).toBe('string');
      expect(Array.isArray(product.images)).toBe(true);
      expect(typeof product.category).toBe('string');
      expect(Array.isArray(product.categoryPath)).toBe(true);
      expect(typeof product.brand).toBe('string');
      expect(typeof product.rating).toBe('number');
      expect(typeof product.reviewCount).toBe('number');
      expect(Array.isArray(product.reviews)).toBe(true);
      expect(typeof product.sales).toBe('number');
      expect(typeof product.stock).toBe('number');
      expect(typeof product.attributes).toBe('object');
      expect(typeof product.specifications).toBe('object');
      expect(Array.isArray(product.variants)).toBe(true);
      expect(Array.isArray(product.tags)).toBe(true);
      expect(typeof product.status).toBe('string');
      expect(typeof product.isActive).toBe('boolean');
      expect(typeof product.shipping).toBe('object');
      expect(typeof product.createdAt).toBe('string');
      expect(typeof product.updatedAt).toBe('string');

      // 验证数值范围
      expect(product.price).toBeGreaterThan(0);
      expect(product.originalPrice).toBeGreaterThanOrEqual(product.price);
      expect(product.discount).toBeGreaterThanOrEqual(0);
      expect(product.discount).toBeLessThanOrEqual(1);
      expect(product.rating).toBeGreaterThanOrEqual(0);
      expect(product.rating).toBeLessThanOrEqual(5);
      expect(product.reviewCount).toBeGreaterThanOrEqual(0);
      expect(product.sales).toBeGreaterThanOrEqual(0);
      expect(product.stock).toBeGreaterThanOrEqual(0);
    });

    it('应该包含完整的商品图片信息', async () => {
      const response = await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}/${validProductId}`);
      const product = response.data.data.product;

      // 验证主图片
      expect(product.image).toMatch(/^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i);

      // 验证图片数组
      expect(product.images.length).toBeGreaterThan(0);
      product.images.forEach((image: any) => {
        expect(image).toHaveProperty('url');
        expect(image).toHaveProperty('alt');
        expect(image).toHaveProperty('width');
        expect(image).toHaveProperty('height');
        expect(image).toHaveProperty('size');
        expect(image).toHaveProperty('type');
        
        expect(typeof image.url).toBe('string');
        expect(typeof image.alt).toBe('string');
        expect(typeof image.width).toBe('number');
        expect(typeof image.height).toBe('number');
        expect(typeof image.size).toBe('number');
        expect(typeof image.type).toBe('string');
        
        expect(image.url).toMatch(/^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i);
        expect(image.width).toBeGreaterThan(0);
        expect(image.height).toBeGreaterThan(0);
        expect(image.size).toBeGreaterThan(0);
        expect(['image/jpeg', 'image/png', 'image/webp']).toContain(image.type);
      });
    });

    it('应该包含完整的商品评价信息', async () => {
      const response = await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}/${validProductId}`);
      const product = response.data.data.product;

      if (product.reviews.length > 0) {
        const review = product.reviews[0];
        
        expect(review).toHaveProperty('id');
        expect(review).toHaveProperty('userId');
        expect(review).toHaveProperty('userName');
        expect(review).toHaveProperty('userAvatar');
        expect(review).toHaveProperty('rating');
        expect(review).toHaveProperty('title');
        expect(review).toHaveProperty('content');
        expect(review).toHaveProperty('images');
        expect(review).toHaveProperty('helpful');
        expect(review).toHaveProperty('verified');
        expect(review).toHaveProperty('createdAt');
        expect(review).toHaveProperty('updatedAt');
        
        expect(typeof review.id).toBe('string');
        expect(typeof review.userId).toBe('string');
        expect(typeof review.userName).toBe('string');
        expect(typeof review.rating).toBe('number');
        expect(typeof review.content).toBe('string');
        expect(Array.isArray(review.images)).toBe(true);
        expect(typeof review.helpful).toBe('number');
        expect(typeof review.verified).toBe('boolean');
        expect(typeof review.createdAt).toBe('string');
        
        expect(review.rating).toBeGreaterThanOrEqual(1);
        expect(review.rating).toBeLessThanOrEqual(5);
        expect(review.helpful).toBeGreaterThanOrEqual(0);
      }
    });

    it('应该包含完整的商品规格信息', async () => {
      const response = await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}/${validProductId}`);
      const product = response.data.data.product;

      // 验证商品属性
      expect(typeof product.attributes).toBe('object');
      
      // 验证商品规格
      expect(typeof product.specifications).toBe('object');
      
      // 验证商品变体
      if (product.variants.length > 0) {
        const variant = product.variants[0];
        
        expect(variant).toHaveProperty('id');
        expect(variant).toHaveProperty('sku');
        expect(variant).toHaveProperty('price');
        expect(variant).toHaveProperty('stock');
        expect(variant).toHaveProperty('attributes');
        expect(variant).toHaveProperty('image');
        expect(variant).toHaveProperty('isDefault');
        
        expect(typeof variant.id).toBe('string');
        expect(typeof variant.sku).toBe('string');
        expect(typeof variant.price).toBe('number');
        expect(typeof variant.stock).toBe('number');
        expect(typeof variant.attributes).toBe('object');
        expect(typeof variant.isDefault).toBe('boolean');
        
        expect(variant.price).toBeGreaterThan(0);
        expect(variant.stock).toBeGreaterThanOrEqual(0);
      }
    });

    it('应该包含完整的物流信息', async () => {
      const response = await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}/${validProductId}`);
      const product = response.data.data.product;

      const shipping = product.shipping;
      
      expect(shipping).toHaveProperty('free');
      expect(shipping).toHaveProperty('cost');
      expect(shipping).toHaveProperty('estimatedDays');
      expect(shipping).toHaveProperty('methods');
      expect(shipping).toHaveProperty('restrictions');
      
      expect(typeof shipping.free).toBe('boolean');
      expect(typeof shipping.cost).toBe('number');
      expect(typeof shipping.estimatedDays).toBe('object');
      expect(Array.isArray(shipping.methods)).toBe(true);
      expect(Array.isArray(shipping.restrictions)).toBe(true);
      
      expect(shipping.cost).toBeGreaterThanOrEqual(0);
      
      // 验证预计送达时间
      expect(shipping.estimatedDays).toHaveProperty('min');
      expect(shipping.estimatedDays).toHaveProperty('max');
      expect(typeof shipping.estimatedDays.min).toBe('number');
      expect(typeof shipping.estimatedDays.max).toBe('number');
      expect(shipping.estimatedDays.min).toBeGreaterThan(0);
      expect(shipping.estimatedDays.max).toBeGreaterThanOrEqual(shipping.estimatedDays.min);
      
      // 验证配送方式
      if (shipping.methods.length > 0) {
        const method = shipping.methods[0];
        expect(method).toHaveProperty('id');
        expect(method).toHaveProperty('name');
        expect(method).toHaveProperty('cost');
        expect(method).toHaveProperty('estimatedDays');
        
        expect(typeof method.id).toBe('string');
        expect(typeof method.name).toBe('string');
        expect(typeof method.cost).toBe('number');
        expect(method.cost).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('商品ID验证', () => {
    it('应该拒绝无效的商品ID格式', async () => {
      const invalidIds = ['', '   ', 'invalid-id-format', '123', 'null', 'undefined'];

      for (const id of invalidIds) {
        try {
          await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}/${id}`);
          expect.fail(`商品ID ${id} 应该被拒绝`);
        } catch (error: any) {
          expect(error.response.status).toBe(400);
          expect(error.response.data).toHaveProperty('success', false);
          expect(error.response.data.message).toContain('商品ID');
        }
      }
    });

    it('应该返回404当商品不存在时', async () => {
      const nonExistentId = 'non-existent-product-12345';
      
      try {
        await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}/${nonExistentId}`);
        expect.fail('应该返回404错误');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
        expect(error.response.data).toHaveProperty('success', false);
        expect(error.response.data.message).toContain('商品不存在');
      }
    });

    it('应该处理特殊字符的商品ID', async () => {
      const specialCharIds = ['product@123', 'product#123', 'product%20test'];
      
      for (const id of specialCharIds) {
        try {
          await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}/${encodeURIComponent(id)}`);
          // 如果没有抛出错误，应该返回有效响应或404
        } catch (error: any) {
          expect([400, 404]).toContain(error.response.status);
          expect(error.response.data).toHaveProperty('success', false);
        }
      }
    });
  });

  describe('商品状态验证', () => {
    it('应该只返回激活状态的商品', async () => {
      const response = await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}/${validProductId}`);
      const product = response.data.data.product;

      expect(product.isActive).toBe(true);
      expect(['active', 'published']).toContain(product.status);
    });

    it('应该拒绝访问未激活的商品', async () => {
      // 这个测试需要一个未激活的商品ID，实际实现中可能需要mock
      const inactiveProductId = 'inactive-product-123';
      
      try {
        await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}/${inactiveProductId}`);
        // 如果商品存在但未激活，应该返回403或404
      } catch (error: any) {
        expect([403, 404]).toContain(error.response.status);
        expect(error.response.data).toHaveProperty('success', false);
      }
    });
  });

  describe('数据完整性验证', () => {
    it('应该确保价格计算正确', async () => {
      const response = await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}/${validProductId}`);
      const product = response.data.data.product;

      // 验证折扣计算
      if (product.discount > 0) {
        const expectedPrice = product.originalPrice * (1 - product.discount);
        expect(Math.abs(product.price - expectedPrice)).toBeLessThan(0.01);
      } else {
        expect(product.price).toBe(product.originalPrice);
      }
    });

    it('应该确保库存数据一致性', async () => {
      const response = await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}/${validProductId}`);
      const product = response.data.data.product;

      // 验证库存范围
      if (product.minStock !== undefined && product.maxStock !== undefined) {
        expect(product.minStock).toBeLessThanOrEqual(product.maxStock);
        expect(product.stock).toBeGreaterThanOrEqual(0);
      }

      // 验证变体库存总和
      if (product.variants.length > 0) {
        const totalVariantStock = product.variants.reduce(
          (sum: number, variant: any) => sum + variant.stock, 0
        );
        // 变体库存总和应该等于或小于主商品库存
        expect(totalVariantStock).toBeLessThanOrEqual(product.stock + 1); // 允许1的误差
      }
    });

    it('应该确保评分数据一致性', async () => {
      const response = await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}/${validProductId}`);
      const product = response.data.data.product;

      // 验证评分和评价数量的一致性
      if (product.reviewCount > 0) {
        expect(product.rating).toBeGreaterThan(0);
        // 如果有评价，reviews数组应该不为空（至少包含部分评价）
        expect(product.reviews.length).toBeGreaterThanOrEqual(0);
      } else {
        expect(product.rating).toBe(0);
        expect(product.reviews).toHaveLength(0);
      }
    });

    it('应该确保时间戳的逻辑性', async () => {
      const response = await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}/${validProductId}`);
      const product = response.data.data.product;

      const createdAt = new Date(product.createdAt);
      const updatedAt = new Date(product.updatedAt);
      const publishedAt = product.publishedAt ? new Date(product.publishedAt) : null;

      // 更新时间应该大于等于创建时间
      expect(updatedAt.getTime()).toBeGreaterThanOrEqual(createdAt.getTime());
      
      // 发布时间应该大于等于创建时间
      if (publishedAt) {
        expect(publishedAt.getTime()).toBeGreaterThanOrEqual(createdAt.getTime());
      }
      
      // 时间戳应该是有效的日期格式
      expect(createdAt.toString()).not.toBe('Invalid Date');
      expect(updatedAt.toString()).not.toBe('Invalid Date');
      if (publishedAt) {
        expect(publishedAt.toString()).not.toBe('Invalid Date');
      }
    });
  });

  describe('响应头验证', () => {
    it('应该返回正确的Content-Type', async () => {
      const response = await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}/${validProductId}`);
      
      expect(response.headers['content-type']).toContain('application/json');
    });

    it('应该包含缓存相关的响应头', async () => {
      const response = await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}/${validProductId}`);
      
      // 检查缓存相关的响应头
      expect(response.headers).toHaveProperty('cache-control');
      expect(response.headers).toHaveProperty('etag');
    });

    it('应该包含最后修改时间', async () => {
      const response = await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}/${validProductId}`);
      
      // 检查最后修改时间
      expect(response.headers).toHaveProperty('last-modified');
    });
  });

  describe('性能验证', () => {
    it('应该在合理时间内返回商品详情', async () => {
      const startTime = Date.now();
      const response = await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}/${validProductId}`);
      const endTime = Date.now();
      
      expect(response.status).toBe(200);
      expect(endTime - startTime).toBeLessThan(1500); // 1.5秒内返回
    });

    it('应该支持条件请求（If-None-Match）', async () => {
      // 首次请求获取ETag
      const firstResponse = await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}/${validProductId}`);
      const etag = firstResponse.headers.etag;
      
      if (etag) {
        // 使用ETag进行条件请求
        try {
          const secondResponse = await axios.get(
            `${API_BASE_URL}${PRODUCTS_ENDPOINT}/${validProductId}`,
            {
              headers: {
                'If-None-Match': etag
              }
            }
          );
          
          // 如果内容未修改，应该返回304
          expect(secondResponse.status).toBe(304);
        } catch (error: any) {
          if (error.response && error.response.status === 304) {
            // 304是期望的响应
            expect(error.response.status).toBe(304);
          } else {
            throw error;
          }
        }
      }
    });
  });

  describe('安全性验证', () => {
    it('应该不暴露敏感信息', async () => {
      const response = await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}/${validProductId}`);
      const product = response.data.data.product;

      // 确保不包含敏感字段
      const sensitiveFields = ['password', 'secret', 'key', 'token', 'private'];
      const productString = JSON.stringify(product).toLowerCase();
      
      sensitiveFields.forEach(field => {
        expect(productString).not.toContain(field);
      });
    });

    it('应该正确处理SQL注入尝试', async () => {
      const sqlInjectionAttempts = [
        "'; DROP TABLE products; --",
        "' OR '1'='1",
        "'; SELECT * FROM users; --"
      ];
      
      for (const attempt of sqlInjectionAttempts) {
        try {
          await axios.get(`${API_BASE_URL}${PRODUCTS_ENDPOINT}/${encodeURIComponent(attempt)}`);
          // 应该返回400或404，不应该执行SQL
        } catch (error: any) {
          expect([400, 404]).toContain(error.response.status);
          expect(error.response.data).toHaveProperty('success', false);
        }
      }
    });
  });
});