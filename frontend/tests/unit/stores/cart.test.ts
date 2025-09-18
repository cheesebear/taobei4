import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useCartStore, selectCartItems, selectSelectedItems, selectCartSummary, selectCartLoading, selectCartError, selectCanCheckout } from '../../../src/stores/cart';
import type { AddToCartRequest, UpdateCartItemRequest, RemoveFromCartRequest, CartItem, Cart, CartSummary } from '../../../src/types/cart';
import { CartStatus, CartItemStatus } from '../../../src/types/cart';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock setTimeout
vi.stubGlobal('setTimeout', vi.fn((fn) => fn()));

describe('useCartStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state
    useCartStore.setState({
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
      lastSyncTime: null
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useCartStore.getState();
      
      expect(state.cart).toBeNull();
      expect(state.cartItems).toEqual([]);
      expect(state.cartLoading).toBe(false);
      expect(state.cartError).toBeNull();
      expect(state.summary).toBeNull();
      expect(state.selectedItems).toEqual([]);
      expect(state.addingToCart).toBe(false);
      expect(state.updatingCart).toBe(false);
      expect(state.removingFromCart).toBe(false);
      expect(state.syncPending).toBe(false);
      expect(state.lastSyncTime).toBeNull();
    });
  });

  describe('fetchCart', () => {
    it('should fetch cart successfully', async () => {
      const { fetchCart } = useCartStore.getState();
      
      await fetchCart();
      
      const state = useCartStore.getState();
      expect(state.cart).toBeTruthy();
      expect(state.cart?.id).toBe('1');
      expect(state.cart?.status).toBe(CartStatus.ACTIVE);
      expect(state.cartLoading).toBe(false);
      expect(state.cartError).toBeNull();
      expect(state.lastSyncTime).toBeTruthy();
    });

    it('should set loading state during fetch', async () => {
      const { fetchCart } = useCartStore.getState();
      
      // Start fetch (don't await)
      const fetchPromise = fetchCart();
      
      // Check loading state immediately
      const loadingState = useCartStore.getState();
      expect(loadingState.cartLoading).toBe(true);
      expect(loadingState.cartError).toBeNull();
      
      // Wait for completion
      await fetchPromise;
      
      const finalState = useCartStore.getState();
      expect(finalState.cartLoading).toBe(false);
    });
  });

  describe('addToCart', () => {
    it('should add new item to cart successfully', async () => {
      const request: AddToCartRequest = {
        productId: 'product-1',
        quantity: 2,
        skuId: 'sku-1'
      };

      const { addToCart } = useCartStore.getState();
      
      await addToCart(request);
      
      const state = useCartStore.getState();
      expect(state.cartItems).toHaveLength(1);
      expect(state.cartItems[0].productId).toBe(request.productId);
      expect(state.cartItems[0].quantity).toBe(request.quantity);
      expect(state.cartItems[0].skuId).toBe(request.skuId);
      expect(state.selectedItems).toContain(state.cartItems[0].id);
      expect(state.addingToCart).toBe(false);
      expect(state.cartError).toBeNull();
    });

    it('should update existing item quantity when adding same product', async () => {
      const request: AddToCartRequest = {
        productId: 'product-1',
        quantity: 2,
        skuId: 'sku-1'
      };

      const { addToCart } = useCartStore.getState();
      
      // Add first time
      await addToCart(request);
      
      // Add same product again
      await addToCart({ ...request, quantity: 3 });
      
      const state = useCartStore.getState();
      expect(state.cartItems).toHaveLength(1);
      expect(state.cartItems[0].quantity).toBe(5); // 2 + 3
    });

    it('should handle invalid quantity', async () => {
      const request: AddToCartRequest = {
        productId: 'product-1',
        quantity: 0 // Invalid quantity
      };

      const { addToCart } = useCartStore.getState();
      
      await expect(addToCart(request)).rejects.toThrow('商品数量必须在1-999之间');
      
      const state = useCartStore.getState();
      expect(state.cartItems).toHaveLength(0);
      expect(state.addingToCart).toBe(false);
      expect(state.cartError).toBe('商品数量必须在1-999之间');
    });

    it('should handle stock shortage', async () => {
      // Mock stock check to return false
      const originalCheckStock = useCartStore.getState().checkStock;
      useCartStore.setState({
        checkStock: vi.fn().mockResolvedValue(false)
      });

      const request: AddToCartRequest = {
        productId: 'product-1',
        quantity: 200 // Exceeds stock
      };

      const { addToCart } = useCartStore.getState();
      
      await expect(addToCart(request)).rejects.toThrow('商品库存不足');
      
      const state = useCartStore.getState();
      expect(state.cartError).toBe('商品库存不足');
      
      // Restore original function
      useCartStore.setState({ checkStock: originalCheckStock });
    });

    it('should set loading state during add', async () => {
      const request: AddToCartRequest = {
        productId: 'product-1',
        quantity: 1
      };

      const { addToCart } = useCartStore.getState();
      
      // Start add (don't await)
      const addPromise = addToCart(request);
      
      // Check loading state immediately
      const loadingState = useCartStore.getState();
      expect(loadingState.addingToCart).toBe(true);
      expect(loadingState.cartError).toBeNull();
      
      // Wait for completion
      await addPromise;
      
      const finalState = useCartStore.getState();
      expect(finalState.addingToCart).toBe(false);
    });
  });

  describe('updateCartItem', () => {
    beforeEach(async () => {
      // Add an item first
      const { addToCart } = useCartStore.getState();
      await addToCart({
        productId: 'product-1',
        quantity: 2
      });
    });

    it('should update item quantity successfully', async () => {
      const state = useCartStore.getState();
      const itemId = state.cartItems[0].id;
      
      const request: UpdateCartItemRequest = {
        itemId,
        quantity: 5
      };

      const { updateCartItem } = useCartStore.getState();
      
      await updateCartItem(request);
      
      const updatedState = useCartStore.getState();
      expect(updatedState.cartItems[0].quantity).toBe(5);
      expect(updatedState.updatingCart).toBe(false);
      expect(updatedState.cartError).toBeNull();
    });

    it('should handle invalid quantity update', async () => {
      const state = useCartStore.getState();
      const itemId = state.cartItems[0].id;
      
      const request: UpdateCartItemRequest = {
        itemId,
        quantity: 0 // Invalid
      };

      const { updateCartItem } = useCartStore.getState();
      
      await expect(updateCartItem(request)).rejects.toThrow('商品数量必须在1-999之间');
      
      const updatedState = useCartStore.getState();
      expect(updatedState.cartError).toBe('商品数量必须在1-999之间');
    });
  });

  describe('removeFromCart', () => {
    beforeEach(async () => {
      // Add an item first
      const { addToCart } = useCartStore.getState();
      await addToCart({
        productId: 'product-1',
        quantity: 2
      });
    });

    it('should remove item from cart successfully', async () => {
      const state = useCartStore.getState();
      const itemId = state.cartItems[0].id;
      
      const request: RemoveFromCartRequest = {
        itemId
      };

      const { removeFromCart } = useCartStore.getState();
      
      await removeFromCart(request);
      
      const updatedState = useCartStore.getState();
      expect(updatedState.cartItems).toHaveLength(0);
      expect(updatedState.selectedItems).not.toContain(itemId);
      expect(updatedState.removingFromCart).toBe(false);
      expect(updatedState.cartError).toBeNull();
    });
  });

  describe('clearCart', () => {
    beforeEach(async () => {
      // Add some items first
      const { addToCart } = useCartStore.getState();
      await addToCart({ productId: 'product-1', quantity: 1 });
      await addToCart({ productId: 'product-2', quantity: 2 });
    });

    it('should clear all items from cart', async () => {
      const { clearCart } = useCartStore.getState();
      
      await clearCart();
      
      const state = useCartStore.getState();
      expect(state.cartItems).toHaveLength(0);
      expect(state.selectedItems).toHaveLength(0);
      expect(state.summary).toBeNull();
      expect(state.cartLoading).toBe(false);
      expect(state.cartError).toBeNull();
    });
  });

  describe('selection operations', () => {
    beforeEach(async () => {
      // Add some items first
      const { addToCart } = useCartStore.getState();
      await addToCart({ productId: 'product-1', quantity: 1 });
      await addToCart({ productId: 'product-2', quantity: 2 });
    });

    it('should select item', () => {
      const state = useCartStore.getState();
      const itemId = state.cartItems[0].id;
      
      // Clear selection first
      useCartStore.setState({ selectedItems: [] });
      
      const { selectItem } = useCartStore.getState();
      selectItem(itemId);
      
      const updatedState = useCartStore.getState();
      expect(updatedState.selectedItems).toContain(itemId);
    });

    it('should unselect item', () => {
      const state = useCartStore.getState();
      const itemId = state.cartItems[0].id;
      
      const { unselectItem } = useCartStore.getState();
      unselectItem(itemId);
      
      const updatedState = useCartStore.getState();
      expect(updatedState.selectedItems).not.toContain(itemId);
    });

    it('should select all items', () => {
      // Clear selection first
      useCartStore.setState({ selectedItems: [] });
      
      const { selectAllItems } = useCartStore.getState();
      selectAllItems();
      
      const state = useCartStore.getState();
      expect(state.selectedItems).toHaveLength(2);
      expect(state.selectedItems).toContain(state.cartItems[0].id);
      expect(state.selectedItems).toContain(state.cartItems[1].id);
    });

    it('should unselect all items', () => {
      const { unselectAllItems } = useCartStore.getState();
      unselectAllItems();
      
      const state = useCartStore.getState();
      expect(state.selectedItems).toHaveLength(0);
    });

    it('should toggle item selection', () => {
      const state = useCartStore.getState();
      const itemId = state.cartItems[0].id;
      
      // Clear selection first
      useCartStore.setState({ selectedItems: [] });
      
      const { toggleItemSelection } = useCartStore.getState();
      
      // Toggle to select
      toggleItemSelection(itemId);
      expect(useCartStore.getState().selectedItems).toContain(itemId);
      
      // Toggle to unselect
      toggleItemSelection(itemId);
      expect(useCartStore.getState().selectedItems).not.toContain(itemId);
    });
  });

  describe('calculation methods', () => {
    beforeEach(async () => {
      // Add some items with known prices
      const { addToCart } = useCartStore.getState();
      await addToCart({ productId: 'product-1', quantity: 2 }); // 2 * 99.99 = 199.98
      await addToCart({ productId: 'product-2', quantity: 1 }); // 1 * 99.99 = 99.99
    });

    it('should calculate summary correctly', () => {
      const { calculateSummary } = useCartStore.getState();
      const summary = calculateSummary();
      
      expect(summary.itemCount).toBe(2);
      expect(summary.totalQuantity).toBe(3);
      expect(summary.totalAmount).toBeCloseTo(299.97, 2); // 2*99.99 + 1*99.99 = 299.97
      expect(summary.totalOriginalAmount).toBeCloseTo(389.97, 2); // 2*129.99 + 1*129.99 = 389.97
      expect(summary.totalDiscount).toBeCloseTo(90, 2); // 389.97 - 299.97 = 90
    });

    it('should get selected items summary', () => {
      const state = useCartStore.getState();
      const firstItemId = state.cartItems[0].id;
      
      // Clear all selections first, then select only first item
      const { unselectAllItems, selectItem } = useCartStore.getState();
      unselectAllItems();
      selectItem(firstItemId);
      
      const { getSelectedItemsSummary } = useCartStore.getState();
      const summary = getSelectedItemsSummary();
      
      expect(summary.itemCount).toBe(1);
      expect(summary.totalQuantity).toBe(2);
      expect(summary.totalAmount).toBe(199.98);
    });

    it('should get item count', () => {
      const { getItemCount } = useCartStore.getState();
      expect(getItemCount()).toBe(2);
    });

    it('should get selected item count', () => {
      const state = useCartStore.getState();
      const firstItemId = state.cartItems[0].id;
      
      // Clear all selections first, then select only first item
      useCartStore.setState({ selectedItems: [] });
      useCartStore.setState({ selectedItems: [firstItemId] });
      
      const { getSelectedItemCount } = useCartStore.getState();
      expect(getSelectedItemCount()).toBe(1);
    });
  });

  describe('validation methods', () => {
    it('should validate cart item correctly', () => {
      const validItem: CartItem = {
        id: '1',
        cartId: '1',
        productId: 'product-1',
        product: {} as any,
        quantity: 2,
        price: 99.99,
        originalPrice: 129.99,
        totalPrice: 199.98,
        status: CartItemStatus.ACTIVE,
        isSelected: true,
        addedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const invalidItem: CartItem = {
        ...validItem,
        quantity: 0, // Invalid quantity
        totalPrice: 100 // Wrong total price
      };
      
      const { validateCartItem } = useCartStore.getState();
      
      expect(validateCartItem(validItem)).toBe(true);
      expect(validateCartItem(invalidItem)).toBe(false);
    });

    it('should check stock', async () => {
      const { checkStock } = useCartStore.getState();
      
      const hasStock = await checkStock('product-1', 50);
      expect(hasStock).toBe(true);
      
      const noStock = await checkStock('product-1', 200);
      expect(noStock).toBe(false);
    });
  });

  describe('utility methods', () => {
    beforeEach(async () => {
      // Add an item first
      const { addToCart } = useCartStore.getState();
      await addToCart({
        productId: 'product-1',
        quantity: 2,
        skuId: 'sku-1'
      });
    });

    it('should find cart item', () => {
      const { findCartItem } = useCartStore.getState();
      
      const foundItem = findCartItem('product-1', 'sku-1');
      expect(foundItem).toBeTruthy();
      expect(foundItem?.productId).toBe('product-1');
      expect(foundItem?.skuId).toBe('sku-1');
      
      const notFoundItem = findCartItem('product-2');
      expect(notFoundItem).toBeNull();
    });

    it('should check if item is selected', () => {
      const state = useCartStore.getState();
      const itemId = state.cartItems[0].id;
      
      const { isItemSelected } = useCartStore.getState();
      
      expect(isItemSelected(itemId)).toBe(true); // Added items are selected by default
      
      // Unselect and check again
      useCartStore.setState({ selectedItems: [] });
      expect(isItemSelected(itemId)).toBe(false);
    });

    it('should check if can checkout', () => {
      const { canCheckout } = useCartStore.getState();
      
      expect(canCheckout()).toBe(true); // Has selected items
      
      // Clear selection
      useCartStore.setState({ selectedItems: [] });
      expect(canCheckout()).toBe(false);
    });

    it('should clear error', () => {
      useCartStore.setState({ cartError: '测试错误' });
      
      const { clearError } = useCartStore.getState();
      clearError();
      
      const state = useCartStore.getState();
      expect(state.cartError).toBeNull();
    });

    it('should clear selection', () => {
      const { clearSelection } = useCartStore.getState();
      clearSelection();
      
      const state = useCartStore.getState();
      expect(state.selectedItems).toHaveLength(0);
    });

    it('should reset cart', () => {
      // Set some state first
      useCartStore.setState({
        cart: {} as any,
        cartError: '错误',
        lastSyncTime: '2023-01-01'
      });
      
      const { resetCart } = useCartStore.getState();
      resetCart();
      
      const state = useCartStore.getState();
      expect(state.cart).toBeNull();
      expect(state.cartItems).toHaveLength(0);
      expect(state.selectedItems).toHaveLength(0);
      expect(state.summary).toBeNull();
      expect(state.cartError).toBeNull();
      expect(state.lastSyncTime).toBeNull();
    });
  });

  describe('batch operations', () => {
    it('should add multiple items to cart', async () => {
      const requests: AddToCartRequest[] = [
        { productId: 'product-1', quantity: 1 },
        { productId: 'product-2', quantity: 2 }
      ];

      const { addMultipleToCart } = useCartStore.getState();
      
      await addMultipleToCart(requests);
      
      const state = useCartStore.getState();
      expect(state.cartItems).toHaveLength(2);
      expect(state.addingToCart).toBe(false);
    });

    it('should remove multiple items from cart', async () => {
      // Add items first
      const { addToCart } = useCartStore.getState();
      await addToCart({ productId: 'product-1', quantity: 1 });
      await addToCart({ productId: 'product-2', quantity: 2 });
      
      const state = useCartStore.getState();
      const itemIds = state.cartItems.map(item => item.id);
      
      const { removeMultipleFromCart } = useCartStore.getState();
      
      await removeMultipleFromCart(itemIds);
      
      const updatedState = useCartStore.getState();
      expect(updatedState.cartItems).toHaveLength(0);
      expect(updatedState.removingFromCart).toBe(false);
    });

    it('should update multiple items', async () => {
      // Add items first
      const { addToCart } = useCartStore.getState();
      await addToCart({ productId: 'product-1', quantity: 1 });
      await addToCart({ productId: 'product-2', quantity: 2 });
      
      const state = useCartStore.getState();
      const requests: UpdateCartItemRequest[] = [
        { itemId: state.cartItems[0].id, quantity: 5 },
        { itemId: state.cartItems[1].id, quantity: 3 }
      ];
      
      const { updateMultipleItems } = useCartStore.getState();
      
      await updateMultipleItems(requests);
      
      const updatedState = useCartStore.getState();
      
      // The updateCartItem method correctly updates quantities as requested
      expect(updatedState.cartItems[0].quantity).toBe(5);
      expect(updatedState.cartItems[1].quantity).toBe(3);
      expect(updatedState.updatingCart).toBe(false);
    });
  });

  describe('sync operations', () => {
    it('should sync with server', async () => {
      const { syncWithServer } = useCartStore.getState();
      
      await syncWithServer();
      
      const state = useCartStore.getState();
      expect(state.syncPending).toBe(false);
      expect(state.lastSyncTime).toBeTruthy();
    });

    it('should merge carts', async () => {
      // Add local item first
      const { addToCart } = useCartStore.getState();
      await addToCart({ productId: 'local-product', quantity: 1 });
      
      const serverCart: Cart = {
        id: '1',
        userId: '1',
        items: [{
          id: 'server-item',
          cartId: '1',
          productId: 'server-product',
          product: {} as any,
          quantity: 2,
          price: 50,
          originalPrice: 60,
          totalPrice: 100,
          status: CartItemStatus.ACTIVE,
          isSelected: true,
          addedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }],
        status: CartStatus.ACTIVE,
        totalAmount: 100,
        totalQuantity: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const { mergeCarts } = useCartStore.getState();
      
      await mergeCarts(serverCart);
      
      const state = useCartStore.getState();
      expect(state.cartItems).toHaveLength(2); // Local + server item
    });
  });

  describe('selectors', () => {
    beforeEach(async () => {
      // Add some items and set up state
      const { addToCart } = useCartStore.getState();
      await addToCart({ productId: 'product-1', quantity: 1 });
      
      useCartStore.setState({
        cartLoading: true,
        cartError: '测试错误'
      });
    });

    it('should select cart items', () => {
      const state = useCartStore.getState();
      expect(selectCartItems(state)).toEqual(state.cartItems);
    });

    it('should select selected items', () => {
      const state = useCartStore.getState();
      expect(selectSelectedItems(state)).toEqual(state.selectedItems);
    });

    it('should select cart summary', () => {
      const state = useCartStore.getState();
      expect(selectCartSummary(state)).toEqual(state.summary);
    });

    it('should select cart loading', () => {
      const state = useCartStore.getState();
      expect(selectCartLoading(state)).toBe(true);
    });

    it('should select cart error', () => {
      const state = useCartStore.getState();
      expect(selectCartError(state)).toBe('测试错误');
    });

    it('should select can checkout', () => {
      const state = useCartStore.getState();
      expect(selectCanCheckout(state)).toBe(state.canCheckout());
    });
  });
});