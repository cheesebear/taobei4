// 购物车相关类型定义
// 基于data-model.md中的CartItem实体

import { Product, ProductSpecCombination } from './product';
import { User } from './user';

/**
 * 购物车项目
 */
export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  product: Product;
  specCombinationId?: string;
  specCombination?: ProductSpecCombination;
  specifications: Record<string, string>;
  quantity: number;
  price: number;
  originalPrice: number;
  discountAmount: number;
  totalPrice: number;
  isSelected: boolean;
  isAvailable: boolean;
  unavailableReason?: string;
  addedAt: string;
  updatedAt: string;
}

/**
 * 购物车
 */
export interface Cart {
  id: string;
  userId: string;
  user?: User;
  items: CartItem[];
  totalItems: number;
  totalQuantity: number;
  totalPrice: number;
  totalOriginalPrice: number;
  totalDiscountAmount: number;
  selectedItems: CartItem[];
  selectedTotalPrice: number;
  selectedTotalQuantity: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 添加到购物车请求
 */
export interface AddToCartRequest {
  productId: string;
  specCombinationId?: string;
  specifications?: Record<string, string>;
  quantity: number;
}

/**
 * 更新购物车项目请求
 */
export interface UpdateCartItemRequest {
  cartItemId: string;
  quantity?: number;
  specifications?: Record<string, string>;
  isSelected?: boolean;
}

/**
 * 批量更新购物车项目请求
 */
export interface BatchUpdateCartItemsRequest {
  items: {
    cartItemId: string;
    quantity?: number;
    isSelected?: boolean;
  }[];
}

/**
 * 删除购物车项目请求
 */
export interface RemoveFromCartRequest {
  cartItemIds: string[];
}

/**
 * 清空购物车请求
 */
export interface ClearCartRequest {
  cartId: string;
  removeUnavailable?: boolean;
}

/**
 * 购物车同步请求
 */
export interface SyncCartRequest {
  localCartItems: LocalCartItem[];
}

/**
 * 本地购物车项目（未登录时使用）
 */
export interface LocalCartItem {
  productId: string;
  specCombinationId?: string;
  specifications: Record<string, string>;
  quantity: number;
  addedAt: string;
}

/**
 * 购物车统计信息
 */
export interface CartStatistics {
  totalItems: number;
  totalQuantity: number;
  totalPrice: number;
  totalOriginalPrice: number;
  totalDiscountAmount: number;
  selectedItems: number;
  selectedQuantity: number;
  selectedTotalPrice: number;
  unavailableItems: number;
}

/**
 * 购物车验证结果
 */
export interface CartValidationResult {
  isValid: boolean;
  errors: CartValidationError[];
  warnings: CartValidationWarning[];
  updatedItems: CartItem[];
}

/**
 * 购物车验证错误
 */
export interface CartValidationError {
  cartItemId: string;
  productId: string;
  productName: string;
  type: CartErrorType;
  message: string;
  currentStock?: number;
  requestedQuantity?: number;
}

/**
 * 购物车验证警告
 */
export interface CartValidationWarning {
  cartItemId: string;
  productId: string;
  productName: string;
  type: CartWarningType;
  message: string;
  oldPrice?: number;
  newPrice?: number;
}

/**
 * 购物车优惠券
 */
export interface CartCoupon {
  id: string;
  code: string;
  name: string;
  description: string;
  type: CouponType;
  value: number;
  minAmount: number;
  maxDiscount?: number;
  applicableProducts: string[];
  applicableCategories: string[];
  isApplicable: boolean;
  discountAmount: number;
  expiresAt: string;
}

/**
 * 购物车结算信息
 */
export interface CartCheckoutInfo {
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  couponDiscount: number;
  shippingFee: number;
  totalAmount: number;
  availableCoupons: CartCoupon[];
  appliedCoupons: CartCoupon[];
  shippingMethods: ShippingMethod[];
  selectedShippingMethod?: ShippingMethod;
}

/**
 * 配送方式
 */
export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  fee: number;
  estimatedDays: number;
  isAvailable: boolean;
}

/**
 * 购物车分组（按店铺分组）
 */
export interface CartGroup {
  shopId: string;
  shopName: string;
  shopLogo?: string;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  isAllSelected: boolean;
  availableShippingMethods: ShippingMethod[];
}

/**
 * 购物车操作历史
 */
export interface CartHistory {
  id: string;
  cartId: string;
  action: CartAction;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  specifications?: Record<string, string>;
  timestamp: string;
}

/**
 * 购物车错误类型枚举
 */
export enum CartErrorType {
  PRODUCT_NOT_FOUND = 'product_not_found',
  PRODUCT_UNAVAILABLE = 'product_unavailable',
  INSUFFICIENT_STOCK = 'insufficient_stock',
  SPEC_NOT_AVAILABLE = 'spec_not_available',
  PRICE_CHANGED = 'price_changed',
  QUANTITY_LIMIT_EXCEEDED = 'quantity_limit_exceeded',
}

/**
 * 购物车警告类型枚举
 */
export enum CartWarningType {
  PRICE_INCREASED = 'price_increased',
  PRICE_DECREASED = 'price_decreased',
  STOCK_LOW = 'stock_low',
  PRODUCT_DISCONTINUED = 'product_discontinued',
}

/**
 * 优惠券类型枚举
 */
export enum CouponType {
  FIXED_AMOUNT = 'fixed_amount',
  PERCENTAGE = 'percentage',
  FREE_SHIPPING = 'free_shipping',
}

/**
 * 购物车操作枚举
 */
export enum CartAction {
  ADD = 'add',
  UPDATE = 'update',
  REMOVE = 'remove',
  CLEAR = 'clear',
  SELECT = 'select',
  UNSELECT = 'unselect',
}

/**
 * 购物车状态枚举
 */
export enum CartStatus {
  ACTIVE = 'active',
  ABANDONED = 'abandoned',
  CONVERTED = 'converted',
}

/**
 * 购物车项目状态枚举
 */
export enum CartItemStatus {
  AVAILABLE = 'available',
  OUT_OF_STOCK = 'out_of_stock',
  DISCONTINUED = 'discontinued',
  PRICE_CHANGED = 'price_changed',
}

/**
 * 购物车本地存储键
 */
export const CART_STORAGE_KEYS = {
  LOCAL_CART: 'local_cart',
  CART_TIMESTAMP: 'cart_timestamp',
  SELECTED_ITEMS: 'selected_cart_items',
} as const;

/**
 * 购物车配置
 */
export interface CartConfig {
  maxItemsPerCart: number;
  maxQuantityPerItem: number;
  autoSyncInterval: number;
  localStorageExpiry: number;
  enableCartHistory: boolean;
  enableAutoValidation: boolean;
}

/**
 * 购物车事件
 */
export interface CartEvent {
  type: CartEventType;
  payload: any;
  timestamp: string;
}

/**
 * 购物车事件类型枚举
 */
export enum CartEventType {
  ITEM_ADDED = 'item_added',
  ITEM_UPDATED = 'item_updated',
  ITEM_REMOVED = 'item_removed',
  CART_CLEARED = 'cart_cleared',
  CART_SYNCED = 'cart_synced',
  VALIDATION_FAILED = 'validation_failed',
  CHECKOUT_STARTED = 'checkout_started',
}
