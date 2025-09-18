// 商品相关API服务
// 提供商品列表、详情、搜索、推荐等商品相关的API调用

import { BaseService } from './BaseService';
import {
  Product,
  ProductDetail,
  ProductListRequest,
  ProductListResponse,
  ProductSearchRequest,
  ProductSearchResponse,
  ProductRecommendationRequest,
  ProductRecommendationResponse,
  ProductCategory,
  ProductCategoryResponse,
  ProductReview,
  ProductReviewListResponse,
  ProductReviewRequest,
  ApiResponse,
} from '../types/product';

/**
 * 商品API服务类
 */
export class ProductService extends BaseService {
  constructor() {
    super('/products');
  }

  /**
   * 获取商品列表
   */
  async getProductList(
    params: ProductListRequest
  ): Promise<ProductListResponse> {
    const response = await this.get<ProductListResponse>('', params);
    return response.data;
  }

  /**
   * 搜索商品
   */
  async searchProducts(
    params: ProductSearchRequest
  ): Promise<ProductSearchResponse> {
    const response = await this.get<ProductSearchResponse>('/search', params);
    return response.data;
  }

  /**
   * 获取商品详情
   */
  async getProductDetail(productId: string): Promise<ProductDetail> {
    const response = await this.get<ProductDetail>(`/${productId}`);
    return response.data;
  }

  /**
   * 获取商品推荐
   */
  async getRecommendedProducts(
    type: RecommendationType,
    options: {
      productId?: string;
      categoryId?: string;
      limit?: number;
      excludeIds?: string[];
    } = {}
  ): Promise<Product[]> {
    try {
      const params = {
        type,
        ...options,
        limit: options.limit || 10,
      };

      const response = await apiClient.get<Product[]>(
        `${this.baseUrl}/recommendations`,
        { params }
      );

      return response.data;
    } catch (error) {
      console.error('[ProductService] Get recommended products failed:', error);
      throw this.handleError(error, '获取推荐商品失败');
    }
  }

  /**
   * 获取热门商品
   */
  async getHotProducts(limit: number = 10): Promise<Product[]> {
    return this.getRecommendedProducts(RecommendationType.HOT, { limit });
  }

  /**
   * 获取新品推荐
   */
  async getNewProducts(limit: number = 10): Promise<Product[]> {
    return this.getRecommendedProducts(RecommendationType.NEW, { limit });
  }

  /**
   * 获取折扣商品
   */
  async getDiscountProducts(limit: number = 10): Promise<Product[]> {
    return this.getRecommendedProducts(RecommendationType.DISCOUNT, { limit });
  }

  /**
   * 获取相似商品
   */
  async getSimilarProducts(
    productId: string,
    limit: number = 10
  ): Promise<Product[]> {
    return this.getRecommendedProducts(RecommendationType.SIMILAR, {
      productId,
      limit,
    });
  }

  /**
   * 获取商品分类
   */
  async getCategories(): Promise<ProductCategoryResponse> {
    const response = await this.get<ProductCategoryResponse>('/categories');
    return response.data;
  }

  /**
   * 获取分类详情
   */
  async getCategoryById(id: string): Promise<Category> {
    try {
      const response = await apiClient.get<Category>(
        `${this.categoryUrl}/${id}`
      );
      return response.data;
    } catch (error) {
      console.error('[ProductService] Get category by id failed:', error);
      throw this.handleError(error, '获取分类详情失败');
    }
  }

  /**
   * 获取分类下的商品
   */
  async getProductsByCategory(
    categoryId: string,
    request: Omit<ProductListRequest, 'categoryId'> = {}
  ): Promise<ProductListResponse> {
    return this.getProducts({ ...request, categoryId });
  }

  /**
   * 获取店铺列表
   */
  async getShops(request: ShopListRequest = {}): Promise<ShopListResponse> {
    try {
      const params = this.buildShopListParams(request);
      const response = await apiClient.getPaginated<Shop[]>(this.shopUrl, {
        params,
      });

      return {
        shops: response.data,
        pagination: response.pagination,
        total: response.total,
      };
    } catch (error) {
      console.error('[ProductService] Get shops failed:', error);
      throw this.handleError(error, '获取店铺列表失败');
    }
  }

  /**
   * 获取店铺详情
   */
  async getShopById(id: string): Promise<Shop> {
    try {
      const response = await apiClient.get<Shop>(`${this.shopUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error('[ProductService] Get shop by id failed:', error);
      throw this.handleError(error, '获取店铺详情失败');
    }
  }

  /**
   * 获取店铺下的商品
   */
  async getProductsByShop(
    shopId: string,
    request: Omit<ProductListRequest, 'shopId'> = {}
  ): Promise<ProductListResponse> {
    return this.getProducts({ ...request, shopId });
  }

  /**
   * 获取商品评论
   */
  async getProductReviews(
    productId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ProductReviewListResponse> {
    const response = await this.get<ProductReviewListResponse>(
      `/${productId}/reviews`,
      { page, limit }
    );
    return response.data;
  }

  /**
   * 添加商品评论
   */
  async addProductReview(
    productId: string,
    review: ProductReviewRequest
  ): Promise<ProductReview> {
    const response = await this.post<ProductReview>(
      `/${productId}/reviews`,
      review
    );
    return response.data;
  }

  /**
   * 获取商品库存信息
   */
  async getProductStock(productId: string): Promise<{
    stock: number;
    available: boolean;
    reservedStock: number;
    lastUpdated: string;
  }> {
    try {
      const response = await apiClient.get<{
        stock: number;
        available: boolean;
        reservedStock: number;
        lastUpdated: string;
      }>(`${this.baseUrl}/${productId}/stock`);

      return response.data;
    } catch (error) {
      console.error('[ProductService] Get product stock failed:', error);
      throw this.handleError(error, '获取商品库存失败');
    }
  }

  /**
   * 获取商品价格历史
   */
  async getProductPriceHistory(
    productId: string,
    days: number = 30
  ): Promise<{
    history: Array<{
      date: string;
      price: number;
      discountPrice?: number;
    }>;
    currentPrice: number;
    lowestPrice: number;
    highestPrice: number;
  }> {
    try {
      const response = await apiClient.get<{
        history: Array<{
          date: string;
          price: number;
          discountPrice?: number;
        }>;
        currentPrice: number;
        lowestPrice: number;
        highestPrice: number;
      }>(`${this.baseUrl}/${productId}/price-history`, {
        params: { days },
      });

      return response.data;
    } catch (error) {
      console.error(
        '[ProductService] Get product price history failed:',
        error
      );
      throw this.handleError(error, '获取商品价格历史失败');
    }
  }

  /**
   * 获取搜索建议
   */
  async getSearchSuggestions(query: string): Promise<string[]> {
    try {
      if (!query || query.trim().length < 2) {
        return [];
      }

      const response = await apiClient.get<string[]>(
        `${this.baseUrl}/search/suggestions`,
        {
          params: { q: query.trim() },
        }
      );

      return response.data;
    } catch (error) {
      console.error('[ProductService] Get search suggestions failed:', error);
      // 搜索建议失败不抛出错误，返回空数组
      return [];
    }
  }

  /**
   * 获取热门搜索关键词
   */
  async getHotSearchKeywords(limit: number = 10): Promise<string[]> {
    try {
      const response = await apiClient.get<string[]>(
        `${this.baseUrl}/search/hot-keywords`,
        {
          params: { limit },
        }
      );

      return response.data;
    } catch (error) {
      console.error('[ProductService] Get hot search keywords failed:', error);
      return [];
    }
  }

  /**
   * 记录商品浏览
   */
  async recordProductView(productId: string): Promise<void> {
    try {
      await apiClient.post(`${this.baseUrl}/${productId}/view`);
    } catch (error) {
      console.error('[ProductService] Record product view failed:', error);
      // 浏览记录失败不影响用户体验，不抛出错误
    }
  }
}

// 创建商品服务实例
export const productService = new ProductService();

// 导出便捷方法
export const product = {
  // 商品相关
  getProducts: (request?: ProductListRequest) =>
    productService.getProducts(request),
  searchProducts: (request: ProductSearchRequest) =>
    productService.searchProducts(request),
  getProductById: (id: string) => productService.getProductById(id),
  getHotProducts: (limit?: number) => productService.getHotProducts(limit),
  getNewProducts: (limit?: number) => productService.getNewProducts(limit),
  getDiscountProducts: (limit?: number) =>
    productService.getDiscountProducts(limit),
  getSimilarProducts: (productId: string, limit?: number) =>
    productService.getSimilarProducts(productId, limit),

  // 分类相关
  getCategories: () => productService.getCategories(),
  getCategoryById: (id: string) => productService.getCategoryById(id),
  getProductsByCategory: (
    categoryId: string,
    request?: Omit<ProductListRequest, 'categoryId'>
  ) => productService.getProductsByCategory(categoryId, request),

  // 店铺相关
  getShops: (request?: ShopListRequest) => productService.getShops(request),
  getShopById: (id: string) => productService.getShopById(id),
  getProductsByShop: (
    shopId: string,
    request?: Omit<ProductListRequest, 'shopId'>
  ) => productService.getProductsByShop(shopId, request),

  // 评价相关
  getProductReviews: (productId: string, options?: any) =>
    productService.getProductReviews(productId, options),
  addProductReview: (productId: string, review: any) =>
    productService.addProductReview(productId, review),

  // 其他功能
  getProductStock: (productId: string) =>
    productService.getProductStock(productId),
  getProductPriceHistory: (productId: string, days?: number) =>
    productService.getProductPriceHistory(productId, days),
  getSearchSuggestions: (query: string) =>
    productService.getSearchSuggestions(query),
  getHotSearchKeywords: (limit?: number) =>
    productService.getHotSearchKeywords(limit),
  recordProductView: (productId: string) =>
    productService.recordProductView(productId),
};

// 导出类型和枚举
export type { ProductFilter, ProductSort };
export { RecommendationType };
