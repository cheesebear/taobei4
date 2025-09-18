// 购物车状态管理
// 使用Zustand管理购物车数据，包含本地存储和同步逻辑

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  Cart,
  CartItem,
  AddToCartRequest,
  UpdateCartItemRequest,
  RemoveFromCartRequest,
  CartSummary,
  CartStatus,
  CartItemStatus,
} from '../types/cart';
import { Product } from '../types/product';
import { User } from '../types/user';

/**
 * 购物车状态接口
 */
interface CartState {
  // 购物车数据
  cart: Cart | null;
  cartItems: CartItem[];
  cartLoading: boolean;
  cartError: string | null;

  // 购物车摘要
  summary: CartSummary | null;

  // 选中的商品项
  selectedItems: string[]; // CartItem IDs

  // 操作状态
  addingToCart: boolean;
  updatingCart: boolean;
  removingFromCart: boolean;

  // 同步状态
  syncPending: boolean;
  lastSyncTime: string | null;

  // 操作方法
  fetchCart: () => Promise<void>;
  addToCart: (request: AddToCartRequest) => Promise<void>;
  updateCartItem: (request: UpdateCartItemRequest) => Promise<void>;
  removeFromCart: (request: RemoveFromCartRequest) => Promise<void>;
  clearCart: () => Promise<void>;

  // 批量操作
  addMultipleToCart: (requests: AddToCartRequest[]) => Promise<void>;
  removeMultipleFromCart: (itemIds: string[]) => Promise<void>;
  updateMultipleItems: (requests: UpdateCartItemRequest[]) => Promise<void>;

  // 选择操作
  selectItem: (itemId: string) => void;
  unselectItem: (itemId: string) => void;
  selectAllItems: () => void;
  unselectAllItems: () => void;
  toggleItemSelection: (itemId: string) => void;

  // 计算方法
  calculateSummary: () => CartSummary;
  getSelectedItemsSummary: () => CartSummary;
  getItemCount: () => number;
  getSelectedItemCount: () => number;

  // 验证方法
  validateCartItem: (item: CartItem) => boolean;
  checkStock: (productId: string, quantity: number) => Promise<boolean>;

  // 同步方法
  syncWithServer: () => Promise<void>;
  mergeCarts: (serverCart: Cart) => Promise<void>;

  // 工具方法
  findCartItem: (productId: string, skuId?: string) => CartItem | null;
  isItemSelected: (itemId: string) => boolean;
  canCheckout: () => boolean;

  // 清理方法
  clearError: () => void;
  clearSelection: () => void;
  resetCart: () => void;
}

/**
 * 购物车配置
 */
const CART_CONFIG = {
  MAX_QUANTITY: 999,
  MIN_QUANTITY: 1,
  SYNC_INTERVAL: 30 * 1000, // 30秒
  AUTO_SAVE_DELAY: 1000, // 1秒
  MAX_ITEMS: 100,
};

/**
 * 模拟购物车数据
 */
const createMockCart = (): Cart => ({
  id: '1',
  userId: '1',
  items: [],
  status: CartStatus.ACTIVE,
  totalAmount: 0,
  totalQuantity: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

/**
 * 模拟API调用
 */
const mockFetchCart = async (): Promise<Cart> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return createMockCart();
};

const mockAddToCart = async (request: AddToCartRequest): Promise<CartItem> => {
  await new Promise(resolve => setTimeout(resolve, 200));

  // 模拟商品数据
  const mockProduct: Product = {
    id: request.productId,
    name: '示例商品',
    description: '这是一个示例商品',
    shortDescription: '示例商品',
    price: 99.99,
    originalPrice: 129.99,
    stock: 100,
    minStock: 1,
    maxStock: 999,
    unit: '件',
    images: [
      {
        id: '1',
        url: 'https://via.placeholder.com/200x200',
        alt: '示例商品',
        sort: 1,
        isMain: true,
      },
    ],
    thumbnail: 'https://via.placeholder.com/100x100',
    categoryId: '1',
    category: {
      id: '1',
      name: '示例分类',
      level: 1,
      path: '/示例分类',
      sort: 1,
      isActive: true,
      productCount: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    shopId: '1',
    shop: {
      id: '1',
      name: '示例店铺',
      logo: 'https://via.placeholder.com/50x50',
      ownerId: '1',
      owner: {
        id: '1',
        name: '店主',
        phone: '13800138000',
      },
      address: {
        province: '北京市',
        city: '北京市',
        district: '朝阳区',
        address: '示例地址',
      },
      contact: {
        phone: '13800138000',
        email: 'shop@example.com',
      },
      businessLicense: 'BL123456',
      status: 'active' as const,
      rating: 4.5,
      reviewCount: 100,
      productCount: 50,
      followerCount: 1000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    brand: '示例品牌',
    model: '示例型号',
    specifications: [],
    attributes: [],
    tags: ['热销'],
    status: 'published' as const,
    isHot: false,
    isNew: false,
    isRecommended: false,
    salesCount: 100,
    viewCount: 1000,
    favoriteCount: 50,
    reviewCount: 20,
    averageRating: 4.5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
  };

  const cartItem: CartItem = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    cartId: '1',
    productId: request.productId,
    product: mockProduct,
    skuId: request.skuId,
    quantity: request.quantity,
    price: mockProduct.price,
    originalPrice: mockProduct.originalPrice,
    totalPrice: mockProduct.price * request.quantity,
    status: CartItemStatus.ACTIVE,
    isSelected: true,
    addedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return cartItem;
};

const mockUpdateCartItem = async (
  request: UpdateCartItemRequest,
  currentItem?: CartItem
): Promise<Partial<CartItem>> => {
  await new Promise(resolve => setTimeout(resolve, 200));

  // 只返回需要更新的字段
  const updates: Partial<CartItem> = {
    updatedAt: new Date().toISOString(),
  };

  if (request.quantity !== undefined) {
    updates.quantity = request.quantity;
    // 使用当前商品的价格，如果没有则使用默认价格
    const price = currentItem?.price || 99.99;
    updates.totalPrice = price * request.quantity;
  }

  return updates;
};

const mockCheckStock = async (
  productId: string,
  quantity: number
): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  // 模拟库存检查，假设库存充足
  return quantity <= 100;
};

/**
 * 创建购物车状态管理
 */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // 初始状态
      cart: null,
      cartItems: [],
      cartLoading: false,
      cartError: null,

      summary: null,
      selectedItems: [],

      addingToCart: false,
      updatingCart: false,
      removingFromCart: false,

      syncPending: false,
      lastSyncTime: null,

      // 获取购物车
      fetchCart: async () => {
        set({ cartLoading: true, cartError: null });

        try {
          const cart = await mockFetchCart();
          const summary = get().calculateSummary();

          set({
            cart,
            cartItems: cart.items || [],
            summary,
            cartLoading: false,
            lastSyncTime: new Date().toISOString(),
          });
        } catch (error) {
          set({
            cartLoading: false,
            cartError:
              error instanceof Error ? error.message : '获取购物车失败',
          });
        }
      },

      // 添加到购物车
      addToCart: async (request: AddToCartRequest) => {
        set({ addingToCart: true, cartError: null });

        try {
          // 验证数量
          if (
            request.quantity < CART_CONFIG.MIN_QUANTITY ||
            request.quantity > CART_CONFIG.MAX_QUANTITY
          ) {
            throw new Error(
              `商品数量必须在${CART_CONFIG.MIN_QUANTITY}-${CART_CONFIG.MAX_QUANTITY}之间`
            );
          }

          // 检查库存
          const hasStock = await mockCheckStock(
            request.productId,
            request.quantity
          );
          if (!hasStock) {
            throw new Error('商品库存不足');
          }

          // 检查是否已存在相同商品
          const { cartItems } = get();
          const existingItem = cartItems.find(
            item =>
              item.productId === request.productId &&
              item.skuId === request.skuId
          );

          if (existingItem) {
            // 更新数量
            const newQuantity = existingItem.quantity + request.quantity;
            await get().updateCartItem({
              itemId: existingItem.id,
              quantity: newQuantity,
            });
          } else {
            // 添加新商品
            const newItem = await mockAddToCart(request);
            const newCartItems = [...cartItems, newItem];
            const newSelectedItems = [...get().selectedItems, newItem.id];

            set({
              cartItems: newCartItems,
              selectedItems: newSelectedItems,
              summary: get().calculateSummary(),
            });
          }

          set({ addingToCart: false });
        } catch (error) {
          set({
            addingToCart: false,
            cartError:
              error instanceof Error ? error.message : '添加到购物车失败',
          });
          throw error;
        }
      },

      // 更新购物车项
      updateCartItem: async (request: UpdateCartItemRequest) => {
        set({ updatingCart: true, cartError: null });

        try {
          if (request.quantity !== undefined) {
            if (
              request.quantity < CART_CONFIG.MIN_QUANTITY ||
              request.quantity > CART_CONFIG.MAX_QUANTITY
            ) {
              throw new Error(
                `商品数量必须在${CART_CONFIG.MIN_QUANTITY}-${CART_CONFIG.MAX_QUANTITY}之间`
              );
            }

            // 检查库存
            const item = get().cartItems.find(i => i.id === request.itemId);
            if (item) {
              const hasStock = await mockCheckStock(
                item.productId,
                request.quantity
              );
              if (!hasStock) {
                throw new Error('商品库存不足');
              }
            }
          }

          const { cartItems } = get();
          const currentItem = cartItems.find(
            item => item.id === request.itemId
          );
          const updatedFields = await mockUpdateCartItem(request, currentItem);
          const newCartItems = cartItems.map(item =>
            item.id === request.itemId ? { ...item, ...updatedFields } : item
          );

          set({
            cartItems: newCartItems,
            summary: get().calculateSummary(),
            updatingCart: false,
          });
        } catch (error) {
          set({
            updatingCart: false,
            cartError:
              error instanceof Error ? error.message : '更新购物车失败',
          });
          throw error;
        }
      },

      // 从购物车移除
      removeFromCart: async (request: RemoveFromCartRequest) => {
        set({ removingFromCart: true, cartError: null });

        try {
          await new Promise(resolve => setTimeout(resolve, 200));

          const { cartItems, selectedItems } = get();
          const newCartItems = cartItems.filter(
            item => item.id !== request.itemId
          );
          const newSelectedItems = selectedItems.filter(
            id => id !== request.itemId
          );

          set({
            cartItems: newCartItems,
            selectedItems: newSelectedItems,
            summary: get().calculateSummary(),
            removingFromCart: false,
          });
        } catch (error) {
          set({
            removingFromCart: false,
            cartError: error instanceof Error ? error.message : '移除商品失败',
          });
          throw error;
        }
      },

      // 清空购物车
      clearCart: async () => {
        set({ cartLoading: true, cartError: null });

        try {
          await new Promise(resolve => setTimeout(resolve, 300));

          set({
            cartItems: [],
            selectedItems: [],
            summary: null,
            cartLoading: false,
          });
        } catch (error) {
          set({
            cartLoading: false,
            cartError:
              error instanceof Error ? error.message : '清空购物车失败',
          });
        }
      },

      // 批量添加到购物车
      addMultipleToCart: async (requests: AddToCartRequest[]) => {
        set({ addingToCart: true, cartError: null });

        try {
          for (const request of requests) {
            await get().addToCart(request);
          }

          set({ addingToCart: false });
        } catch (error) {
          set({
            addingToCart: false,
            cartError: error instanceof Error ? error.message : '批量添加失败',
          });
          throw error;
        }
      },

      // 批量移除
      removeMultipleFromCart: async (itemIds: string[]) => {
        set({ removingFromCart: true, cartError: null });

        try {
          for (const itemId of itemIds) {
            await get().removeFromCart({ itemId });
          }

          set({ removingFromCart: false });
        } catch (error) {
          set({
            removingFromCart: false,
            cartError: error instanceof Error ? error.message : '批量移除失败',
          });
          throw error;
        }
      },

      // 批量更新
      updateMultipleItems: async (requests: UpdateCartItemRequest[]) => {
        set({ updatingCart: true, cartError: null });

        try {
          // 获取当前购物车状态
          let currentCartItems = get().cartItems;

          // 顺序处理更新请求，避免并发状态冲突
          for (const request of requests) {
            const currentItem = currentCartItems.find(
              item => item.id === request.itemId
            );
            const updatedFields = await mockUpdateCartItem(
              request,
              currentItem
            );

            // 立即应用更新到当前状态
            currentCartItems = currentCartItems.map(item => {
              if (item.id === request.itemId) {
                return { ...item, ...updatedFields };
              }
              return item;
            });
          }

          set({
            cartItems: currentCartItems,
            summary: get().calculateSummary(),
            updatingCart: false,
          });
        } catch (error) {
          set({
            updatingCart: false,
            cartError: error instanceof Error ? error.message : '批量更新失败',
          });
          throw error;
        }
      },

      // 选择商品项
      selectItem: (itemId: string) => {
        const { selectedItems } = get();
        if (!selectedItems.includes(itemId)) {
          set({ selectedItems: [...selectedItems, itemId] });
        }
      },

      // 取消选择商品项
      unselectItem: (itemId: string) => {
        const { selectedItems } = get();
        set({ selectedItems: selectedItems.filter(id => id !== itemId) });
      },

      // 全选
      selectAllItems: () => {
        const { cartItems } = get();
        const allItemIds = cartItems.map(item => item.id);
        set({ selectedItems: allItemIds });
      },

      // 取消全选
      unselectAllItems: () => {
        set({ selectedItems: [] });
      },

      // 切换选择状态
      toggleItemSelection: (itemId: string) => {
        const { selectedItems } = get();
        if (selectedItems.includes(itemId)) {
          get().unselectItem(itemId);
        } else {
          get().selectItem(itemId);
        }
      },

      // 计算购物车摘要
      calculateSummary: (): CartSummary => {
        const { cartItems } = get();

        const totalQuantity = cartItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        const totalAmount = cartItems.reduce(
          (sum, item) => sum + item.totalPrice,
          0
        );
        const totalOriginalAmount = cartItems.reduce(
          (sum, item) =>
            sum + (item.originalPrice || item.price) * item.quantity,
          0
        );
        const totalDiscount = totalOriginalAmount - totalAmount;

        return {
          totalQuantity,
          totalAmount,
          totalOriginalAmount,
          totalDiscount,
          itemCount: cartItems.length,
        };
      },

      // 获取选中商品摘要
      getSelectedItemsSummary: (): CartSummary => {
        const { cartItems, selectedItems } = get();
        const selectedCartItems = cartItems.filter(item =>
          selectedItems.includes(item.id)
        );

        const totalQuantity = selectedCartItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        const totalAmount = selectedCartItems.reduce(
          (sum, item) => sum + item.totalPrice,
          0
        );
        const totalOriginalAmount = selectedCartItems.reduce(
          (sum, item) =>
            sum + (item.originalPrice || item.price) * item.quantity,
          0
        );
        const totalDiscount = totalOriginalAmount - totalAmount;

        return {
          totalQuantity,
          totalAmount,
          totalOriginalAmount,
          totalDiscount,
          itemCount: selectedCartItems.length,
        };
      },

      // 获取商品总数
      getItemCount: (): number => {
        return get().cartItems.length;
      },

      // 获取选中商品数
      getSelectedItemCount: (): number => {
        return get().selectedItems.length;
      },

      // 验证购物车项
      validateCartItem: (item: CartItem): boolean => {
        return (
          item.quantity >= CART_CONFIG.MIN_QUANTITY &&
          item.quantity <= CART_CONFIG.MAX_QUANTITY &&
          item.price > 0 &&
          item.totalPrice === item.price * item.quantity
        );
      },

      // 检查库存
      checkStock: async (
        productId: string,
        quantity: number
      ): Promise<boolean> => {
        return await mockCheckStock(productId, quantity);
      },

      // 与服务器同步
      syncWithServer: async () => {
        set({ syncPending: true });

        try {
          const serverCart = await mockFetchCart();
          await get().mergeCarts(serverCart);

          set({
            syncPending: false,
            lastSyncTime: new Date().toISOString(),
          });
        } catch (error) {
          set({ syncPending: false });
          throw error;
        }
      },

      // 合并购物车
      mergeCarts: async (serverCart: Cart) => {
        // 简化的合并逻辑，实际应用中需要更复杂的冲突解决
        const { cartItems } = get();
        const serverItems = serverCart.items || [];

        // 合并逻辑：本地优先，服务器补充
        const mergedItems = [...cartItems];

        for (const serverItem of serverItems) {
          const existingItem = mergedItems.find(
            item =>
              item.productId === serverItem.productId &&
              item.skuId === serverItem.skuId
          );

          if (!existingItem) {
            mergedItems.push(serverItem);
          }
        }

        set({
          cartItems: mergedItems,
          summary: get().calculateSummary(),
        });
      },

      // 查找购物车项
      findCartItem: (productId: string, skuId?: string): CartItem | null => {
        const { cartItems } = get();
        return (
          cartItems.find(
            item => item.productId === productId && item.skuId === skuId
          ) || null
        );
      },

      // 检查是否选中
      isItemSelected: (itemId: string): boolean => {
        return get().selectedItems.includes(itemId);
      },

      // 检查是否可以结账
      canCheckout: (): boolean => {
        const { selectedItems, cartItems } = get();
        return (
          selectedItems.length > 0 &&
          cartItems.some(item => selectedItems.includes(item.id))
        );
      },

      // 清除错误
      clearError: () => {
        set({ cartError: null });
      },

      // 清除选择
      clearSelection: () => {
        set({ selectedItems: [] });
      },

      // 重置购物车
      resetCart: () => {
        set({
          cart: null,
          cartItems: [],
          selectedItems: [],
          summary: null,
          cartError: null,
          lastSyncTime: null,
        });
      },
    }),
    {
      name: 'taobei-cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        cartItems: state.cartItems,
        selectedItems: state.selectedItems,
        lastSyncTime: state.lastSyncTime,
      }),
    }
  )
);

// 导出选择器
export const selectCartItems = (state: CartState) => state.cartItems;
export const selectSelectedItems = (state: CartState) => state.selectedItems;
export const selectCartSummary = (state: CartState) => state.summary;
export const selectCartLoading = (state: CartState) => state.cartLoading;
export const selectCartError = (state: CartState) => state.cartError;
export const selectCanCheckout = (state: CartState) => state.canCheckout();
