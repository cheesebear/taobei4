import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useProductStore, selectProducts, selectCurrentProduct, selectCategories, selectSearchParams, selectFavorites, selectViewHistory, selectProductListLoading, selectProductDetailLoading } from '../../../src/stores/product';
import type { ProductSearchParams, ProductRecommendationParams, Product, ProductFavorite, ProductHistory } from '../../../src/types/product';
import { ProductSortBy, ProductStatus } from '../../../src/types/product';

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

describe('useProductStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state
    useProductStore.setState({
      products: [],
      productListLoading: false,
      productListError: null,
      productListPagination: null,
      currentProduct: null,
      productDetailLoading: false,
      productDetailError: null,
      relatedProducts: [],
      categories: [],
      categoryTree: [],
      categoriesLoading: false,
      categoriesError: null,
      shops: [],
      currentShop: null,
      shopsLoading: false,
      shopsError: null,
      searchParams: {},
      searchHistory: [],
      searchSuggestions: [],
      favorites: [],
      viewHistory: [],
      cache: {
        products: new Map(),
        categories: new Map(),
        shops: new Map()
      }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useProductStore.getState();
      
      expect(state.products).toEqual([]);
      expect(state.productListLoading).toBe(false);
      expect(state.productListError).toBeNull();
      expect(state.productListPagination).toBeNull();
      expect(state.currentProduct).toBeNull();
      expect(state.productDetailLoading).toBe(false);
      expect(state.productDetailError).toBeNull();
      expect(state.relatedProducts).toEqual([]);
      expect(state.categories).toEqual([]);
      expect(state.categoryTree).toEqual([]);
      expect(state.categoriesLoading).toBe(false);
      expect(state.categoriesError).toBeNull();
      expect(state.shops).toEqual([]);
      expect(state.currentShop).toBeNull();
      expect(state.shopsLoading).toBe(false);
      expect(state.shopsError).toBeNull();
      expect(state.searchParams).toEqual({});
      expect(state.searchHistory).toEqual([]);
      expect(state.searchSuggestions).toEqual([]);
      expect(state.favorites).toEqual([]);
      expect(state.viewHistory).toEqual([]);
      expect(state.cache.products).toBeInstanceOf(Map);
      expect(state.cache.categories).toBeInstanceOf(Map);
      expect(state.cache.shops).toBeInstanceOf(Map);
    });
  });

  describe('fetchProducts', () => {
    it('should fetch products successfully', async () => {
      const { fetchProducts } = useProductStore.getState();
      
      await fetchProducts();
      
      const state = useProductStore.getState();
      expect(state.products).toHaveLength(1); // Mock data has 1 product
      expect(state.products[0].name).toBe('iPhone 15 Pro Max');
      expect(state.productListLoading).toBe(false);
      expect(state.productListError).toBeNull();
      expect(state.productListPagination).toBeTruthy();
      expect(state.productListPagination?.total).toBe(1);
    });

    it('should set loading state during fetch', async () => {
      const { fetchProducts } = useProductStore.getState();
      
      // Start fetch (don't await)
      const fetchPromise = fetchProducts();
      
      // Check loading state immediately
      const loadingState = useProductStore.getState();
      expect(loadingState.productListLoading).toBe(true);
      expect(loadingState.productListError).toBeNull();
      
      // Wait for completion
      await fetchPromise;
      
      const finalState = useProductStore.getState();
      expect(finalState.productListLoading).toBe(false);
    });

    it('should fetch products with search params', async () => {
      const params: ProductSearchParams = {
        keyword: 'iPhone',
        categoryId: '1',
        page: 1,
        limit: 10,
        sortBy: ProductSortBy.PRICE,
        sortOrder: 'asc'
      };

      const { fetchProducts } = useProductStore.getState();
      
      await fetchProducts(params);
      
      const state = useProductStore.getState();
      expect(state.searchParams).toEqual(params);
      expect(state.products).toHaveLength(1);
      expect(state.productListLoading).toBe(false);
    });

    it('should cache products after fetch', async () => {
      const { fetchProducts, getCachedProduct } = useProductStore.getState();
      
      await fetchProducts();
      
      const state = useProductStore.getState();
      const firstProduct = state.products[0];
      const cachedProduct = getCachedProduct(firstProduct.id);
      
      expect(cachedProduct).toEqual(firstProduct);
    });
  });

  describe('fetchProductDetail', () => {
    it('should fetch product detail successfully', async () => {
      const { fetchProductDetail } = useProductStore.getState();
      
      await fetchProductDetail('1');
      
      const state = useProductStore.getState();
      expect(state.currentProduct).toBeTruthy();
      expect(state.currentProduct?.id).toBe('1');
      expect(state.currentProduct?.name).toBe('iPhone 15 Pro Max');
      expect(state.relatedProducts).toHaveLength(1); // Mock data only has 1 product
      expect(state.productDetailLoading).toBe(false);
      expect(state.productDetailError).toBeNull();
    });

    it('should use cached product if available', async () => {
      const mockProduct: Product = {
        id: '1',
        name: 'Cached Product',
        description: 'Test product',
        shortDescription: 'Test',
        price: 100,
        originalPrice: 120,
        stock: 50,
        minStock: 5,
        maxStock: 100,
        unit: '个',
        images: [],
        thumbnail: '',
        categoryId: '1',
        category: {} as any,
        shopId: '1',
        shop: {} as any,
        brand: 'Test',
        model: 'Test Model',
        specifications: [],
        attributes: [],
        tags: [],
        status: ProductStatus.PUBLISHED,
        isHot: false,
        isNew: false,
        isRecommended: false,
        salesCount: 0,
        viewCount: 0,
        favoriteCount: 0,
        reviewCount: 0,
        averageRating: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString()
      };

      const { setCachedProduct, fetchProductDetail } = useProductStore.getState();
      
      // Set cached product
      setCachedProduct(mockProduct);
      
      await fetchProductDetail('1');
      
      const state = useProductStore.getState();
      expect(state.currentProduct?.name).toBe('Cached Product');
      expect(state.productDetailLoading).toBe(false);
    });

    it('should handle product not found error', async () => {
      const { fetchProductDetail } = useProductStore.getState();
      
      await fetchProductDetail('nonexistent');
      
      const state = useProductStore.getState();
      expect(state.productDetailLoading).toBe(false);
      expect(state.productDetailError).toBe('商品不存在');
      expect(state.currentProduct).toBeNull();
    });

    it('should add product to view history', async () => {
      const { fetchProductDetail } = useProductStore.getState();
      
      await fetchProductDetail('1');
      
      const state = useProductStore.getState();
      expect(state.viewHistory).toHaveLength(1);
      expect(state.viewHistory[0].productId).toBe('1');
      expect(state.viewHistory[0].product.name).toBe('iPhone 15 Pro Max');
    });
  });

  describe('fetchCategories', () => {
    it('should fetch categories successfully', async () => {
      const { fetchCategories } = useProductStore.getState();
      
      await fetchCategories();
      
      const state = useProductStore.getState();
      expect(state.categories).toHaveLength(2);
      expect(state.categories[0].name).toBe('手机数码');
      expect(state.categories[1].name).toBe('服装鞋帽');
      expect(state.categoriesLoading).toBe(false);
      expect(state.categoriesError).toBeNull();
    });

    it('should set loading state during fetch', async () => {
      const { fetchCategories } = useProductStore.getState();
      
      // Start fetch (don't await)
      const fetchPromise = fetchCategories();
      
      // Check loading state immediately
      const loadingState = useProductStore.getState();
      expect(loadingState.categoriesLoading).toBe(true);
      expect(loadingState.categoriesError).toBeNull();
      
      // Wait for completion
      await fetchPromise;
      
      const finalState = useProductStore.getState();
      expect(finalState.categoriesLoading).toBe(false);
    });
  });

  describe('fetchShops', () => {
    it('should fetch shops successfully', async () => {
      const { fetchShops } = useProductStore.getState();
      
      await fetchShops();
      
      const state = useProductStore.getState();
      expect(state.shops).toHaveLength(1);
      expect(state.shops[0].name).toBe('Apple官方旗舰店');
      expect(state.shopsLoading).toBe(false);
      expect(state.shopsError).toBeNull();
    });
  });

  describe('fetchShopDetail', () => {
    it('should fetch shop detail successfully', async () => {
      const { fetchShopDetail } = useProductStore.getState();
      
      await fetchShopDetail('1');
      
      const state = useProductStore.getState();
      expect(state.currentShop).toBeTruthy();
      expect(state.currentShop?.name).toBe('Apple官方旗舰店');
      expect(state.shopsLoading).toBe(false);
      expect(state.shopsError).toBeNull();
    });

    it('should handle shop not found error', async () => {
      const { fetchShopDetail } = useProductStore.getState();
      
      await fetchShopDetail('nonexistent');
      
      const state = useProductStore.getState();
      expect(state.shopsLoading).toBe(false);
      expect(state.shopsError).toBe('店铺不存在');
      expect(state.currentShop).toBeNull();
    });
  });

  describe('search functionality', () => {
    it('should search products and add to history', async () => {
      const { searchProducts } = useProductStore.getState();
      
      await searchProducts('iPhone');
      
      const state = useProductStore.getState();
      expect(state.searchHistory).toContain('iPhone');
      expect(state.searchParams.keyword).toBe('iPhone');
      expect(state.products).toHaveLength(1);
    });

    it('should add search history correctly', () => {
      const { addSearchHistory } = useProductStore.getState();
      
      addSearchHistory('iPhone');
      addSearchHistory('Samsung');
      addSearchHistory('iPhone'); // Duplicate
      
      const state = useProductStore.getState();
      expect(state.searchHistory).toEqual(['iPhone', 'Samsung']);
    });

    it('should clear search history', () => {
      const { addSearchHistory, clearSearchHistory } = useProductStore.getState();
      
      addSearchHistory('iPhone');
      addSearchHistory('Samsung');
      
      expect(useProductStore.getState().searchHistory).toHaveLength(2);
      
      clearSearchHistory();
      
      expect(useProductStore.getState().searchHistory).toHaveLength(0);
    });

    it('should limit search history to max items', () => {
      const { addSearchHistory } = useProductStore.getState();
      
      // Add more than max items (20)
      for (let i = 0; i < 25; i++) {
        addSearchHistory(`keyword${i}`);
      }
      
      const state = useProductStore.getState();
      expect(state.searchHistory).toHaveLength(20);
      expect(state.searchHistory[0]).toBe('keyword24'); // Latest first
    });
  });

  describe('favorites functionality', () => {
    it('should add product to favorites', async () => {
      const { addToFavorites } = useProductStore.getState();
      
      await addToFavorites('1');
      
      const state = useProductStore.getState();
      expect(state.favorites).toHaveLength(1);
      expect(state.favorites[0].productId).toBe('1');
      expect(state.favorites[0].userId).toBe('1');
    });

    it('should remove product from favorites', async () => {
      const { addToFavorites, removeFromFavorites } = useProductStore.getState();
      
      await addToFavorites('1');
      expect(useProductStore.getState().favorites).toHaveLength(1);
      
      await removeFromFavorites('1');
      expect(useProductStore.getState().favorites).toHaveLength(0);
    });

    it('should fetch favorites list', async () => {
      const { fetchFavorites } = useProductStore.getState();
      
      await fetchFavorites();
      
      const state = useProductStore.getState();
      expect(state.favorites).toEqual([]);
    });
  });

  describe('view history functionality', () => {
    it('should add product to view history', () => {
      const mockProduct: Product = {
        id: '1',
        name: 'Test Product',
        description: 'Test description',
        shortDescription: 'Test',
        price: 100,
        originalPrice: 120,
        stock: 50,
        minStock: 5,
        maxStock: 100,
        unit: '个',
        images: [],
        thumbnail: '',
        categoryId: '1',
        category: {} as any,
        shopId: '1',
        shop: {} as any,
        brand: 'Test',
        model: 'Test Model',
        specifications: [],
        attributes: [],
        tags: [],
        status: ProductStatus.PUBLISHED,
        isHot: false,
        isNew: false,
        isRecommended: false,
        salesCount: 0,
        viewCount: 0,
        favoriteCount: 0,
        reviewCount: 0,
        averageRating: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString()
      };

      const { addToHistory } = useProductStore.getState();
      
      addToHistory(mockProduct);
      
      const state = useProductStore.getState();
      expect(state.viewHistory).toHaveLength(1);
      expect(state.viewHistory[0].productId).toBe('1');
      expect(state.viewHistory[0].product.name).toBe('Test Product');
    });

    it('should prevent duplicate entries in view history', () => {
      const mockProduct: Product = {
        id: '1',
        name: 'Test Product',
        description: 'Test description',
        shortDescription: 'Test',
        price: 100,
        originalPrice: 120,
        stock: 50,
        minStock: 5,
        maxStock: 100,
        unit: '个',
        images: [],
        thumbnail: '',
        categoryId: '1',
        category: {} as any,
        shopId: '1',
        shop: {} as any,
        brand: 'Test',
        model: 'Test Model',
        specifications: [],
        attributes: [],
        tags: [],
        status: ProductStatus.PUBLISHED,
        isHot: false,
        isNew: false,
        isRecommended: false,
        salesCount: 0,
        viewCount: 0,
        favoriteCount: 0,
        reviewCount: 0,
        averageRating: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString()
      };

      const { addToHistory } = useProductStore.getState();
      
      addToHistory(mockProduct);
      addToHistory(mockProduct); // Add same product again
      
      const state = useProductStore.getState();
      expect(state.viewHistory).toHaveLength(1);
    });

    it('should clear view history', () => {
      const mockProduct: Product = {
        id: '1',
        name: 'Test Product',
        description: 'Test description',
        shortDescription: 'Test',
        price: 100,
        originalPrice: 120,
        stock: 50,
        minStock: 5,
        maxStock: 100,
        unit: '个',
        images: [],
        thumbnail: '',
        categoryId: '1',
        category: {} as any,
        shopId: '1',
        shop: {} as any,
        brand: 'Test',
        model: 'Test Model',
        specifications: [],
        attributes: [],
        tags: [],
        status: ProductStatus.PUBLISHED,
        isHot: false,
        isNew: false,
        isRecommended: false,
        salesCount: 0,
        viewCount: 0,
        favoriteCount: 0,
        reviewCount: 0,
        averageRating: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString()
      };

      const { addToHistory, clearHistory } = useProductStore.getState();
      
      addToHistory(mockProduct);
      expect(useProductStore.getState().viewHistory).toHaveLength(1);
      
      clearHistory();
      expect(useProductStore.getState().viewHistory).toHaveLength(0);
    });
  });

  describe('recommendations', () => {
    it('should fetch product recommendations', async () => {
      const params: ProductRecommendationParams = {
        userId: '1',
        limit: 5
      };

      const { fetchRecommendations } = useProductStore.getState();
      
      const recommendations = await fetchRecommendations(params);
      
      expect(recommendations).toHaveLength(1); // Mock returns 1 product
      expect(recommendations[0].name).toBe('iPhone 15 Pro Max');
    });
  });

  describe('utility methods', () => {
    it('should set search params', () => {
      const params: Partial<ProductSearchParams> = {
        keyword: 'iPhone',
        categoryId: '1'
      };

      const { setSearchParams } = useProductStore.getState();
      
      setSearchParams(params);
      
      const state = useProductStore.getState();
      expect(state.searchParams).toEqual(params);
    });

    it('should clear products', () => {
      // Set some products first
      useProductStore.setState({
        products: [{} as any],
        productListPagination: {} as any,
        productListError: 'error'
      });
      
      const { clearProducts } = useProductStore.getState();
      clearProducts();
      
      const state = useProductStore.getState();
      expect(state.products).toEqual([]);
      expect(state.productListPagination).toBeNull();
      expect(state.productListError).toBeNull();
    });

    it('should clear current product', () => {
      // Set current product first
      useProductStore.setState({
        currentProduct: {} as any,
        relatedProducts: [{} as any],
        productDetailError: 'error'
      });
      
      const { clearCurrentProduct } = useProductStore.getState();
      clearCurrentProduct();
      
      const state = useProductStore.getState();
      expect(state.currentProduct).toBeNull();
      expect(state.relatedProducts).toEqual([]);
      expect(state.productDetailError).toBeNull();
    });

    it('should update product in list', async () => {
      // First fetch products to have some data
      const { fetchProducts, updateProductInList } = useProductStore.getState();
      await fetchProducts();
      
      const state = useProductStore.getState();
      const productId = state.products[0].id;
      const originalName = state.products[0].name;
      
      updateProductInList(productId, { name: 'Updated Product Name' });
      
      const updatedState = useProductStore.getState();
      expect(updatedState.products[0].name).toBe('Updated Product Name');
      expect(updatedState.products[0].name).not.toBe(originalName);
    });
  });

  describe('cache management', () => {
    it('should clear cache', () => {
      const { setCachedProduct, clearCache } = useProductStore.getState();
      
      // Set some cached data
      const mockProduct: Product = {
        id: '1',
        name: 'Test Product',
        description: 'Test description',
        shortDescription: 'Test',
        price: 100,
        originalPrice: 120,
        stock: 50,
        minStock: 5,
        maxStock: 100,
        unit: '个',
        images: [],
        thumbnail: '',
        categoryId: '1',
        category: {} as any,
        shopId: '1',
        shop: {} as any,
        brand: 'Test',
        model: 'Test Model',
        specifications: [],
        attributes: [],
        tags: [],
        status: ProductStatus.PUBLISHED,
        isHot: false,
        isNew: false,
        isRecommended: false,
        salesCount: 0,
        viewCount: 0,
        favoriteCount: 0,
        reviewCount: 0,
        averageRating: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString()
      };
      
      setCachedProduct(mockProduct);
      expect(useProductStore.getState().cache.products.size).toBe(1);
      
      clearCache();
      expect(useProductStore.getState().cache.products.size).toBe(0);
    });

    it('should get cached product', () => {
      const mockProduct: Product = {
        id: '1',
        name: 'Test Product',
        description: 'Test description',
        shortDescription: 'Test',
        price: 100,
        originalPrice: 120,
        stock: 50,
        minStock: 5,
        maxStock: 100,
        unit: '个',
        images: [],
        thumbnail: '',
        categoryId: '1',
        category: {} as any,
        shopId: '1',
        shop: {} as any,
        brand: 'Test',
        model: 'Test Model',
        specifications: [],
        attributes: [],
        tags: [],
        status: ProductStatus.PUBLISHED,
        isHot: false,
        isNew: false,
        isRecommended: false,
        salesCount: 0,
        viewCount: 0,
        favoriteCount: 0,
        reviewCount: 0,
        averageRating: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString()
      };

      const { setCachedProduct, getCachedProduct } = useProductStore.getState();
      
      setCachedProduct(mockProduct);
      const cachedProduct = getCachedProduct('1');
      
      expect(cachedProduct).toEqual(mockProduct);
    });

    it('should return null for non-existent cached product', () => {
      const { getCachedProduct } = useProductStore.getState();
      
      const cachedProduct = getCachedProduct('nonexistent');
      
      expect(cachedProduct).toBeNull();
    });

    it('should set cached product', () => {
      const mockProduct: Product = {
        id: '1',
        name: 'Test Product',
        description: 'Test description',
        shortDescription: 'Test',
        price: 100,
        originalPrice: 120,
        stock: 50,
        minStock: 5,
        maxStock: 100,
        unit: '个',
        images: [],
        thumbnail: '',
        categoryId: '1',
        category: {} as any,
        shopId: '1',
        shop: {} as any,
        brand: 'Test',
        model: 'Test Model',
        specifications: [],
        attributes: [],
        tags: [],
        status: ProductStatus.PUBLISHED,
        isHot: false,
        isNew: false,
        isRecommended: false,
        salesCount: 0,
        viewCount: 0,
        favoriteCount: 0,
        reviewCount: 0,
        averageRating: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString()
      };

      const { setCachedProduct } = useProductStore.getState();
      
      setCachedProduct(mockProduct);
      
      const state = useProductStore.getState();
      expect(state.cache.products.has('1')).toBe(true);
      expect(state.cache.products.get('1')?.data).toEqual(mockProduct);
      expect(state.cache.products.get('1')?.timestamp).toBeTypeOf('number');
    });
  });

  describe('selectors', () => {
    beforeEach(async () => {
      // Set up some test data
      const { fetchProducts, fetchCategories, addToFavorites } = useProductStore.getState();
      await fetchProducts();
      await fetchCategories();
      await addToFavorites('1');
      
      useProductStore.setState({
        productListLoading: true,
        productDetailLoading: true,
        searchParams: { keyword: 'test' }
      });
    });

    it('should select products', () => {
      const state = useProductStore.getState();
      expect(selectProducts(state)).toEqual(state.products);
    });

    it('should select current product', () => {
      const state = useProductStore.getState();
      expect(selectCurrentProduct(state)).toEqual(state.currentProduct);
    });

    it('should select categories', () => {
      const state = useProductStore.getState();
      expect(selectCategories(state)).toEqual(state.categories);
    });

    it('should select search params', () => {
      const state = useProductStore.getState();
      expect(selectSearchParams(state)).toEqual(state.searchParams);
    });

    it('should select favorites', () => {
      const state = useProductStore.getState();
      expect(selectFavorites(state)).toEqual(state.favorites);
    });

    it('should select view history', () => {
      const state = useProductStore.getState();
      expect(selectViewHistory(state)).toEqual(state.viewHistory);
    });

    it('should select product list loading', () => {
      const state = useProductStore.getState();
      expect(selectProductListLoading(state)).toBe(true);
    });

    it('should select product detail loading', () => {
      const state = useProductStore.getState();
      expect(selectProductDetailLoading(state)).toBe(true);
    });
  });
});