// 商品相关类型定义
// 基于data-model.md中的Product实体

import type { PaginatedResponse } from './user';

/**
 * 商品基础信息
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  originalPrice?: number;
  discountPrice?: number;
  stock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  weight?: number;
  volume?: number;
  images: ProductImage[];
  thumbnail: string;
  categoryId: string;
  category: Category;
  shopId: string;
  shop: Shop;
  brand?: string;
  model?: string;
  specifications: ProductSpecification[];
  attributes: ProductAttribute[];
  tags: string[];
  status: ProductStatus;
  isHot: boolean;
  isNew: boolean;
  isRecommended: boolean;
  salesCount: number;
  viewCount: number;
  favoriteCount: number;
  reviewCount: number;
  averageRating: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

/**
 * 商品图片
 */
export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  sort: number;
  isMain: boolean;
  width?: number;
  height?: number;
}

/**
 * 商品规格
 */
export interface ProductSpecification {
  id: string;
  name: string;
  values: ProductSpecValue[];
  required: boolean;
  sort: number;
}

/**
 * 商品规格值
 */
export interface ProductSpecValue {
  id: string;
  value: string;
  price?: number;
  stock?: number;
  image?: string;
  sort: number;
}

/**
 * 商品属性
 */
export interface ProductAttribute {
  id: string;
  name: string;
  value: string;
  unit?: string;
  sort: number;
}

/**
 * 商品分类
 */
export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  image?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  level: number;
  path: string;
  sort: number;
  isActive: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 店铺信息
 */
export interface Shop {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  banner?: string;
  ownerId: string;
  owner: {
    id: string;
    name: string;
    phone: string;
  };
  address: {
    province: string;
    city: string;
    district: string;
    address: string;
  };
  contact: {
    phone: string;
    email?: string;
    wechat?: string;
  };
  businessLicense: string;
  status: ShopStatus;
  rating: number;
  reviewCount: number;
  productCount: number;
  followerCount: number;
  createdAt: string;
  updatedAt: string;
  verifiedAt?: string;
}

/**
 * 商品搜索参数
 */
export interface ProductSearchParams {
  keyword?: string;
  categoryId?: string;
  shopId?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  status?: ProductStatus;
  isHot?: boolean;
  isNew?: boolean;
  isRecommended?: boolean;
  sortBy?: ProductSortBy;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/**
 * 商品列表响应
 */
export interface ProductListResponse extends PaginatedResponse<Product> {
  filters: {
    categories: Category[];
    brands: string[];
    priceRange: {
      min: number;
      max: number;
    };
    tags: string[];
  };
}

/**
 * 商品详情响应
 */
export interface ProductDetailResponse {
  product: Product;
  relatedProducts: Product[];
  reviews: ProductReview[];
  questions: ProductQuestion[];
}

/**
 * 商品评价
 */
export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  user: {
    id: string;
    username: string;
    avatar?: string;
  };
  orderId: string;
  rating: number;
  content: string;
  images: string[];
  specifications?: Record<string, string>;
  isAnonymous: boolean;
  isVerified: boolean;
  likeCount: number;
  replyCount: number;
  replies: ProductReviewReply[];
  createdAt: string;
  updatedAt: string;
}

/**
 * 商品评价回复
 */
export interface ProductReviewReply {
  id: string;
  reviewId: string;
  userId: string;
  user: {
    id: string;
    username: string;
    avatar?: string;
  };
  content: string;
  isShopOwner: boolean;
  createdAt: string;
}

/**
 * 商品问答
 */
export interface ProductQuestion {
  id: string;
  productId: string;
  userId: string;
  user: {
    id: string;
    username: string;
    avatar?: string;
  };
  question: string;
  answer?: string;
  answeredBy?: {
    id: string;
    username: string;
    isShopOwner: boolean;
  };
  answeredAt?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 商品收藏
 */
export interface ProductFavorite {
  id: string;
  productId: string;
  userId: string;
  createdAt: string;
}

/**
 * 商品浏览历史
 */
export interface ProductHistory {
  id: string;
  productId: string;
  product: Product;
  userId: string;
  viewedAt: string;
}

/**
 * 商品状态枚举
 */
export enum ProductStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  SOLD_OUT = 'sold_out',
  DISCONTINUED = 'discontinued',
  BANNED = 'banned',
}

/**
 * 店铺状态枚举
 */
export enum ShopStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  CLOSED = 'closed',
}

/**
 * 商品排序方式枚举
 */
export enum ProductSortBy {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  PRICE = 'price',
  SALES_COUNT = 'salesCount',
  VIEW_COUNT = 'viewCount',
  FAVORITE_COUNT = 'favoriteCount',
  REVIEW_COUNT = 'reviewCount',
  AVERAGE_RATING = 'averageRating',
  NAME = 'name',
}

/**
 * 分类树节点
 */
export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
}

/**
 * 商品规格组合
 */
export interface ProductSpecCombination {
  id: string;
  productId: string;
  specifications: Record<string, string>;
  price: number;
  stock: number;
  sku: string;
  image?: string;
  isActive: boolean;
}

/**
 * 商品库存更新请求
 */
export interface UpdateProductStockRequest {
  productId: string;
  stock: number;
  operation: 'set' | 'increase' | 'decrease';
}

/**
 * 商品价格更新请求
 */
export interface UpdateProductPriceRequest {
  productId: string;
  price: number;
  originalPrice?: number;
  discountPrice?: number;
}

/**
 * 添加商品到收藏请求
 */
export interface AddToFavoriteRequest {
  productId: string;
}

/**
 * 商品搜索建议
 */
export interface ProductSearchSuggestion {
  keyword: string;
  type: 'product' | 'category' | 'brand' | 'shop';
  count: number;
}

/**
 * 商品推荐参数
 */
export interface ProductRecommendationParams {
  userId?: string;
  productId?: string;
  categoryId?: string;
  type: 'similar' | 'related' | 'hot' | 'new' | 'personalized';
  limit?: number;
}
