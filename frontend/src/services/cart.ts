// 购物车API服务
// 提供添加商品到购物车、更新数量、删除商品、清空购物车等购物车相关的API调用

import { apiClient, ApiError } from './api';
import {
  CartItem,
  Cart,
  AddToCartRequest,
  AddToCartResponse,
  UpdateCartItemRequest,
  UpdateCartItemResponse,
  RemoveFromCartRequest,
  RemoveFromCartResponse,
  CartSummaryResponse,
  CheckoutRequest,
  CheckoutResponse,
  ApiResponse,
} from '../types/cart';

/**
 * 批量操作请求
 */
export interface BatchCartOperation {
  type: 'add' | 'update' | 'remove';
  productId: string;
  quantity?: number;
  selectedAttributes?: Record<string, string>;
}

/**
 * 购物车合并选项
 */
export interface CartMergeOptions {
  strategy: 'replace' | 'merge' | 'keep_local';
  conflictResolution?: 'sum' | 'max' | 'server_wins' | 'client_wins';
}

/**
 * 购物车同步状态
 */
export interface CartSyncStatus {
  lastSyncTime: string;
  hasLocalChanges: boolean;
  hasServerChanges: boolean;
  conflictItems: string[];
}

/**
 * 购物车API服务类
 */
export class CartService {
  private readonly baseUrl = '/cart';
  private syncInProgress = false;
  private pendingOperations: Array<() => Promise<any>> = [];

  /**
   * 获取购物车内容
   */
  async getCart(): Promise<Cart> {
    try {
      const response = await apiClient.get<Cart>(this.baseUrl);

      // 更新本地缓存
      this.updateLocalCart(response.data);

      return response.data;
    } catch (error) {
      console.error('[CartService] Get cart failed:', error);

      // 如果网络错误，尝试从本地缓存获取
      if (this.isNetworkError(error)) {
        const localCart = this.getLocalCart();
        if (localCart) {
          return localCart;
        }
      }

      throw this.handleError(error, '获取购物车失败');
    }
  }

  /**
   * 添加商品到购物车
   */
  async addToCart(request: AddToCartRequest): Promise<AddToCartResponse> {
    try {
      // 乐观更新本地状态
      this.optimisticAddToCart(request);

      const response = await apiClient.post<AddToCartResponse>(
        `${this.baseUrl}/add`,
        request
      );

      // 更新本地缓存
      if (response.success && response.data) {
        this.updateLocalCart(response.data.cart);
      }

      return response.data;
    } catch (error) {
      console.error('[CartService] Add to cart failed:', error);

      // 回滚乐观更新
      this.rollbackOptimisticUpdate();

      throw this.handleError(error, '添加到购物车失败');
    }
  }

  /**
   * 更新购物车商品
   */
  async updateCartItem(
    request: UpdateCartItemRequest
  ): Promise<UpdateCartItemResponse> {
    try {
      // 乐观更新本地状态
      this.optimisticUpdateCartItem(request);

      const response = await apiClient.put<UpdateCartItemResponse>(
        `${this.baseUrl}/items/${request.productId}`,
        {
          quantity: request.quantity,
          selectedAttributes: request.selectedAttributes,
        }
      );

      // 更新本地缓存
      if (response.success && response.data) {
        this.updateLocalCart(response.data.cart);
      }

      return response.data;
    } catch (error) {
      console.error('[CartService] Update cart item failed:', error);

      // 回滚乐观更新
      this.rollbackOptimisticUpdate();

      throw this.handleError(error, '更新购物车商品失败');
    }
  }

  /**
   * 从购物车移除商品
   */
  async removeFromCart(
    request: RemoveFromCartRequest
  ): Promise<RemoveFromCartResponse> {
    try {
      // 乐观更新本地状态
      this.optimisticRemoveFromCart(request);

      const response = await apiClient.delete<RemoveFromCartResponse>(
        `${this.baseUrl}/items/${request.productId}`
      );

      // 更新本地缓存
      if (response.success && response.data) {
        this.updateLocalCart(response.data.cart);
      }

      return response.data;
    } catch (error) {
      console.error('[CartService] Remove from cart failed:', error);

      // 回滚乐观更新
      this.rollbackOptimisticUpdate();

      throw this.handleError(error, '从购物车移除商品失败');
    }
  }

  /**
   * 清空购物车
   */
  async clearCart(): Promise<ApiResponse<void>> {
    try {
      // 备份当前购物车状态
      const currentCart = this.getLocalCart();

      // 乐观更新本地状态
      this.updateLocalCart({
        id: currentCart?.id || '',
        userId: currentCart?.userId || '',
        items: [],
        totalAmount: 0,
        totalItems: 0,
        createdAt: currentCart?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const response = await apiClient.delete<void>(`${this.baseUrl}/clear`);

      return response;
    } catch (error) {
      console.error('[CartService] Clear cart failed:', error);

      // 回滚乐观更新
      this.rollbackOptimisticUpdate();

      throw this.handleError(error, '清空购物车失败');
    }
  }

  /**
   * 批量操作购物车
   */
  async batchOperation(operations: BatchCartOperation[]): Promise<Cart> {
    try {
      const response = await apiClient.post<Cart>(`${this.baseUrl}/batch`, {
        operations,
      });

      // 更新本地缓存
      if (response.success && response.data) {
        this.updateLocalCart(response.data);
      }

      return response.data;
    } catch (error) {
      console.error('[CartService] Batch operation failed:', error);
      throw this.handleError(error, '批量操作失败');
    }
  }

  /**
   * 获取购物车摘要
   */
  async getCartSummary(): Promise<CartSummaryResponse> {
    try {
      const response = await apiClient.get<CartSummaryResponse>(
        `${this.baseUrl}/summary`
      );

      return response.data;
    } catch (error) {
      console.error('[CartService] Get cart summary failed:', error);

      // 如果网络错误，从本地计算摘要
      if (this.isNetworkError(error)) {
        const localCart = this.getLocalCart();
        if (localCart) {
          return this.calculateLocalSummary(localCart);
        }
      }

      throw this.handleError(error, '获取购物车摘要失败');
    }
  }

  /**
   * 验证购物车
   */
  async validateCart(): Promise<{
    isValid: boolean;
    issues: Array<{
      type: 'out_of_stock' | 'price_changed' | 'unavailable' | 'limit_exceeded';
      productId: string;
      message: string;
      currentValue?: any;
      expectedValue?: any;
    }>;
  }> {
    try {
      const response = await apiClient.post<{
        isValid: boolean;
        issues: Array<{
          type:
            | 'out_of_stock'
            | 'price_changed'
            | 'unavailable'
            | 'limit_exceeded';
          productId: string;
          message: string;
          currentValue?: any;
          expectedValue?: any;
        }>;
      }>(`${this.baseUrl}/validate`);

      return response.data;
    } catch (error) {
      console.error('[CartService] Validate cart failed:', error);
      throw this.handleError(error, '验证购物车失败');
    }
  }

  /**
   * 应用优惠券
   */
  async applyCoupon(couponCode: string): Promise<{
    success: boolean;
    discount: number;
    cart: Cart;
    message?: string;
  }> {
    try {
      const response = await apiClient.post<{
        success: boolean;
        discount: number;
        cart: Cart;
        message?: string;
      }>(`${this.baseUrl}/coupon`, {
        couponCode,
      });

      // 更新本地缓存
      if (response.success && response.data.success) {
        this.updateLocalCart(response.data.cart);
      }

      return response.data;
    } catch (error) {
      console.error('[CartService] Apply coupon failed:', error);
      throw this.handleError(error, '应用优惠券失败');
    }
  }

  /**
   * 移除优惠券
   */
  async removeCoupon(): Promise<Cart> {
    try {
      const response = await apiClient.delete<Cart>(`${this.baseUrl}/coupon`);

      // 更新本地缓存
      if (response.success && response.data) {
        this.updateLocalCart(response.data);
      }

      return response.data;
    } catch (error) {
      console.error('[CartService] Remove coupon failed:', error);
      throw this.handleError(error, '移除优惠券失败');
    }
  }

  /**
   * 预结算
   */
  async preCheckout(): Promise<{
    cart: Cart;
    shippingOptions: Array<{
      id: string;
      name: string;
      price: number;
      estimatedDays: number;
    }>;
    paymentMethods: Array<{
      id: string;
      name: string;
      type: string;
      available: boolean;
    }>;
    totalAmount: number;
    taxes: number;
    shipping: number;
  }> {
    try {
      const response = await apiClient.post<{
        cart: Cart;
        shippingOptions: Array<{
          id: string;
          name: string;
          price: number;
          estimatedDays: number;
        }>;
        paymentMethods: Array<{
          id: string;
          name: string;
          type: string;
          available: boolean;
        }>;
        totalAmount: number;
        taxes: number;
        shipping: number;
      }>(`${this.baseUrl}/pre-checkout`);

      return response.data;
    } catch (error) {
      console.error('[CartService] Pre-checkout failed:', error);
      throw this.handleError(error, '预结算失败');
    }
  }

  /**
   * 结算
   */
  async checkout(request: CheckoutRequest): Promise<CheckoutResponse> {
    try {
      const response = await apiClient.post<CheckoutResponse>(
        `${this.baseUrl}/checkout`,
        request
      );

      // 结算成功后清空本地购物车
      if (response.success && response.data) {
        this.clearLocalCart();
      }

      return response.data;
    } catch (error) {
      console.error('[CartService] Checkout failed:', error);
      throw this.handleError(error, '结算失败');
    }
  }

  /**
   * 同步购物车
   */
  async syncCart(
    options: CartMergeOptions = { strategy: 'merge' }
  ): Promise<Cart> {
    if (this.syncInProgress) {
      throw new Error('同步正在进行中');
    }

    this.syncInProgress = true;

    try {
      const localCart = this.getLocalCart();
      const response = await apiClient.post<Cart>(`${this.baseUrl}/sync`, {
        localCart,
        options,
      });

      // 更新本地缓存
      if (response.success && response.data) {
        this.updateLocalCart(response.data);
      }

      return response.data;
    } catch (error) {
      console.error('[CartService] Sync cart failed:', error);
      throw this.handleError(error, '同步购物车失败');
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * 获取同步状态
   */
  async getSyncStatus(): Promise<CartSyncStatus> {
    try {
      const response = await apiClient.get<CartSyncStatus>(
        `${this.baseUrl}/sync-status`
      );

      return response.data;
    } catch (error) {
      console.error('[CartService] Get sync status failed:', error);
      throw this.handleError(error, '获取同步状态失败');
    }
  }

  /**
   * 保存购物车为稍后购买
   */
  async saveForLater(productId: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.post<void>(
        `${this.baseUrl}/save-for-later`,
        { productId }
      );

      return response;
    } catch (error) {
      console.error('[CartService] Save for later failed:', error);
      throw this.handleError(error, '保存到稍后购买失败');
    }
  }

  /**
   * 从稍后购买移回购物车
   */
  async moveToCart(productId: string): Promise<AddToCartResponse> {
    try {
      const response = await apiClient.post<AddToCartResponse>(
        `${this.baseUrl}/move-to-cart`,
        { productId }
      );

      // 更新本地缓存
      if (response.success && response.data) {
        this.updateLocalCart(response.data.cart);
      }

      return response.data;
    } catch (error) {
      console.error('[CartService] Move to cart failed:', error);
      throw this.handleError(error, '移回购物车失败');
    }
  }

  /**
   * 获取稍后购买列表
   */
  async getSavedForLater(): Promise<CartItem[]> {
    try {
      const response = await apiClient.get<CartItem[]>(
        `${this.baseUrl}/saved-for-later`
      );

      return response.data;
    } catch (error) {
      console.error('[CartService] Get saved for later failed:', error);
      throw this.handleError(error, '获取稍后购买列表失败');
    }
  }

  /**
   * 获取本地购物车
   */
  private getLocalCart(): Cart | null {
    try {
      const cartStr = localStorage.getItem('cart');
      return cartStr ? JSON.parse(cartStr) : null;
    } catch (error) {
      console.error('[CartService] Get local cart failed:', error);
      return null;
    }
  }

  /**
   * 更新本地购物车
   */
  private updateLocalCart(cart: Cart): void {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
      localStorage.setItem('cartLastUpdated', new Date().toISOString());
    } catch (error) {
      console.error('[CartService] Update local cart failed:', error);
    }
  }

  /**
   * 清空本地购物车
   */
  private clearLocalCart(): void {
    try {
      localStorage.removeItem('cart');
      localStorage.removeItem('cartLastUpdated');
    } catch (error) {
      console.error('[CartService] Clear local cart failed:', error);
    }
  }

  /**
   * 乐观添加到购物车
   */
  private optimisticAddToCart(request: AddToCartRequest): void {
    // 实现乐观更新逻辑
    // 这里可以立即更新本地状态，提供更好的用户体验
  }

  /**
   * 乐观更新购物车商品
   */
  private optimisticUpdateCartItem(request: UpdateCartItemRequest): void {
    // 实现乐观更新逻辑
  }

  /**
   * 乐观移除购物车商品
   */
  private optimisticRemoveFromCart(request: RemoveFromCartRequest): void {
    // 实现乐观更新逻辑
  }

  /**
   * 回滚乐观更新
   */
  private rollbackOptimisticUpdate(): void {
    // 实现回滚逻辑
    // 可以从服务器重新获取购物车状态
  }

  /**
   * 计算本地购物车摘要
   */
  private calculateLocalSummary(cart: Cart): CartSummaryResponse {
    return {
      totalItems: cart.totalItems,
      totalAmount: cart.totalAmount,
      itemCount: cart.items.length,
      hasItems: cart.items.length > 0,
    };
  }

  /**
   * 检查是否为网络错误
   */
  private isNetworkError(error: any): boolean {
    return (
      error instanceof ApiError &&
      (error.type === 'NETWORK_ERROR' || error.type === 'TIMEOUT_ERROR')
    );
  }

  /**
   * 处理错误
   */
  private handleError(error: any, defaultMessage: string): ApiError {
    if (error instanceof ApiError) {
      return error;
    }

    return new ApiError(
      error.message || defaultMessage,
      error.type || 'UNKNOWN_ERROR',
      error.status,
      error.code,
      error.data
    );
  }
}

// 创建购物车服务实例
export const cartService = new CartService();

// 导出便捷方法
export const cart = {
  // 基础操作
  getCart: () => cartService.getCart(),
  addToCart: (request: AddToCartRequest) => cartService.addToCart(request),
  updateCartItem: (request: UpdateCartItemRequest) =>
    cartService.updateCartItem(request),
  removeFromCart: (request: RemoveFromCartRequest) =>
    cartService.removeFromCart(request),
  clearCart: () => cartService.clearCart(),

  // 批量操作
  batchOperation: (operations: BatchCartOperation[]) =>
    cartService.batchOperation(operations),

  // 摘要和验证
  getCartSummary: () => cartService.getCartSummary(),
  validateCart: () => cartService.validateCart(),

  // 优惠券
  applyCoupon: (couponCode: string) => cartService.applyCoupon(couponCode),
  removeCoupon: () => cartService.removeCoupon(),

  // 结算
  preCheckout: () => cartService.preCheckout(),
  checkout: (request: CheckoutRequest) => cartService.checkout(request),

  // 同步
  syncCart: (options?: CartMergeOptions) => cartService.syncCart(options),
  getSyncStatus: () => cartService.getSyncStatus(),

  // 稍后购买
  saveForLater: (productId: string) => cartService.saveForLater(productId),
  moveToCart: (productId: string) => cartService.moveToCart(productId),
  getSavedForLater: () => cartService.getSavedForLater(),
};

// 导出类型
export type { BatchCartOperation, CartMergeOptions, CartSyncStatus };
