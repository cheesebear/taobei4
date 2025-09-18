// 商品数据状态管理
// 使用Zustand管理商品数据，包含缓存和分页逻辑

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  Product,
  Category,
  Shop,
  ProductSearchParams,
  ProductListResponse,
  ProductDetailResponse,
  ProductReview,
  ProductQuestion,
  ProductFavorite,
  ProductHistory,
  ProductSortBy,
  ProductStatus,
  CategoryTreeNode,
  ProductRecommendationParams,
} from '../types/product';
import { PaginatedResponse } from '../types/user';

/**
 * 商品状态接口
 */
interface ProductState {
  // 商品列表状态
  products: Product[];
  productListLoading: boolean;
  productListError: string | null;
  productListPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;

  // 商品详情状态
  currentProduct: Product | null;
  productDetailLoading: boolean;
  productDetailError: string | null;
  relatedProducts: Product[];

  // 分类状态
  categories: Category[];
  categoryTree: CategoryTreeNode[];
  categoriesLoading: boolean;
  categoriesError: string | null;

  // 店铺状态
  shops: Shop[];
  currentShop: Shop | null;
  shopsLoading: boolean;
  shopsError: string | null;

  // 搜索和筛选状态
  searchParams: ProductSearchParams;
  searchHistory: string[];
  searchSuggestions: string[];

  // 收藏和历史
  favorites: ProductFavorite[];
  viewHistory: ProductHistory[];

  // 缓存状态
  cache: {
    products: Map<string, { data: Product; timestamp: number }>;
    categories: Map<string, { data: Category[]; timestamp: number }>;
    shops: Map<string, { data: Shop; timestamp: number }>;
  };

  // 操作方法
  fetchProducts: (params?: ProductSearchParams) => Promise<void>;
  fetchProductDetail: (productId: string) => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchShops: () => Promise<void>;
  fetchShopDetail: (shopId: string) => Promise<void>;

  // 搜索相关
  searchProducts: (
    keyword: string,
    params?: Partial<ProductSearchParams>
  ) => Promise<void>;
  addSearchHistory: (keyword: string) => void;
  clearSearchHistory: () => void;

  // 收藏相关
  addToFavorites: (productId: string) => Promise<void>;
  removeFromFavorites: (productId: string) => Promise<void>;
  fetchFavorites: () => Promise<void>;

  // 浏览历史
  addToHistory: (product: Product) => void;
  clearHistory: () => void;

  // 推荐相关
  fetchRecommendations: (
    params: ProductRecommendationParams
  ) => Promise<Product[]>;

  // 工具方法
  setSearchParams: (params: Partial<ProductSearchParams>) => void;
  clearProducts: () => void;
  clearCurrentProduct: () => void;
  updateProductInList: (productId: string, updates: Partial<Product>) => void;

  // 缓存管理
  clearCache: () => void;
  getCachedProduct: (productId: string) => Product | null;
  setCachedProduct: (product: Product) => void;
}

/**
 * 缓存配置
 */
const CACHE_CONFIG = {
  PRODUCT_TTL: 5 * 60 * 1000, // 5分钟
  CATEGORY_TTL: 30 * 60 * 1000, // 30分钟
  SHOP_TTL: 10 * 60 * 1000, // 10分钟
  MAX_HISTORY_ITEMS: 50,
  MAX_SEARCH_HISTORY: 20,
};

/**
 * 模拟商品数据
 */
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro Max',
    description: '最新款iPhone，配备A17 Pro芯片，钛金属设计',
    shortDescription: '全新iPhone 15 Pro Max',
    price: 9999,
    originalPrice: 10999,
    stock: 100,
    minStock: 10,
    maxStock: 1000,
    unit: '台',
    images: [
      {
        id: '1',
        url: 'https://via.placeholder.com/400x400',
        alt: 'iPhone 15 Pro Max',
        sort: 1,
        isMain: true,
      },
    ],
    thumbnail: 'https://via.placeholder.com/200x200',
    categoryId: '1',
    category: {
      id: '1',
      name: '手机数码',
      level: 1,
      path: '/手机数码',
      sort: 1,
      isActive: true,
      productCount: 100,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    shopId: '1',
    shop: {
      id: '1',
      name: 'Apple官方旗舰店',
      logo: 'https://via.placeholder.com/100x100',
      ownerId: '1',
      owner: {
        id: '1',
        name: 'Apple Inc.',
        phone: '400-666-8800',
      },
      address: {
        province: '北京市',
        city: '北京市',
        district: '朝阳区',
        address: '建国门外大街1号',
      },
      contact: {
        phone: '400-666-8800',
        email: 'support@apple.com',
      },
      businessLicense: 'BL123456789',
      status: 'active' as const,
      rating: 4.9,
      reviewCount: 10000,
      productCount: 50,
      followerCount: 100000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    brand: 'Apple',
    model: 'iPhone 15 Pro Max',
    specifications: [],
    attributes: [],
    tags: ['新品', '热销', '5G'],
    status: 'published' as const,
    isHot: true,
    isNew: true,
    isRecommended: true,
    salesCount: 1000,
    viewCount: 50000,
    favoriteCount: 5000,
    reviewCount: 800,
    averageRating: 4.8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
  },
];

/**
 * 模拟分类数据
 */
const mockCategories: Category[] = [
  {
    id: '1',
    name: '手机数码',
    level: 1,
    path: '/手机数码',
    sort: 1,
    isActive: true,
    productCount: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: '服装鞋帽',
    level: 1,
    path: '/服装鞋帽',
    sort: 2,
    isActive: true,
    productCount: 200,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * 模拟API调用
 */
const mockFetchProducts = async (
  params: ProductSearchParams = {}
): Promise<ProductListResponse> => {
  await new Promise(resolve => setTimeout(resolve, 500));

  const {
    page = 1,
    limit = 20,
    keyword,
    categoryId,
    sortBy,
    sortOrder,
  } = params;

  let filteredProducts = [...mockProducts];

  // 关键词搜索
  if (keyword) {
    filteredProducts = filteredProducts.filter(
      p =>
        p.name.toLowerCase().includes(keyword.toLowerCase()) ||
        p.description.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  // 分类筛选
  if (categoryId) {
    filteredProducts = filteredProducts.filter(
      p => p.categoryId === categoryId
    );
  }

  // 排序
  if (sortBy) {
    filteredProducts.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case ProductSortBy.PRICE:
          aValue = a.price;
          bValue = b.price;
          break;
        case ProductSortBy.SALES_COUNT:
          aValue = a.salesCount;
          bValue = b.salesCount;
          break;
        case ProductSortBy.CREATED_AT:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });
  }

  const total = filteredProducts.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const items = filteredProducts.slice(startIndex, endIndex);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
    filters: {
      categories: mockCategories,
      brands: ['Apple', 'Samsung', 'Huawei'],
      priceRange: { min: 0, max: 20000 },
      tags: ['新品', '热销', '5G', '折扣'],
    },
  };
};

const mockFetchProductDetail = async (
  productId: string
): Promise<ProductDetailResponse> => {
  await new Promise(resolve => setTimeout(resolve, 300));

  const product = mockProducts.find(p => p.id === productId);
  if (!product) {
    throw new Error('商品不存在');
  }

  return {
    product,
    relatedProducts: mockProducts.slice(0, 4),
    reviews: [],
    questions: [],
  };
};

/**
 * 创建商品状态管理
 */
export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      // 初始状态
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
        shops: new Map(),
      },

      // 获取商品列表
      fetchProducts: async (params: ProductSearchParams = {}) => {
        set({ productListLoading: true, productListError: null });

        try {
          const response = await mockFetchProducts(params);

          set({
            products: response.items,
            productListPagination: response.pagination,
            productListLoading: false,
            searchParams: params,
          });

          // 缓存商品数据
          response.items.forEach(product => {
            get().setCachedProduct(product);
          });
        } catch (error) {
          set({
            productListLoading: false,
            productListError:
              error instanceof Error ? error.message : '获取商品列表失败',
          });
        }
      },

      // 获取商品详情
      fetchProductDetail: async (productId: string) => {
        // 先检查缓存
        const cachedProduct = get().getCachedProduct(productId);
        if (cachedProduct) {
          set({ currentProduct: cachedProduct });
          return;
        }

        set({ productDetailLoading: true, productDetailError: null });

        try {
          const response = await mockFetchProductDetail(productId);

          set({
            currentProduct: response.product,
            relatedProducts: response.relatedProducts,
            productDetailLoading: false,
          });

          // 缓存商品数据
          get().setCachedProduct(response.product);

          // 添加到浏览历史
          get().addToHistory(response.product);
        } catch (error) {
          set({
            productDetailLoading: false,
            productDetailError:
              error instanceof Error ? error.message : '获取商品详情失败',
          });
        }
      },

      // 获取分类列表
      fetchCategories: async () => {
        set({ categoriesLoading: true, categoriesError: null });

        try {
          await new Promise(resolve => setTimeout(resolve, 300));

          set({
            categories: mockCategories,
            categoriesLoading: false,
          });
        } catch (error) {
          set({
            categoriesLoading: false,
            categoriesError:
              error instanceof Error ? error.message : '获取分类失败',
          });
        }
      },

      // 获取店铺列表
      fetchShops: async () => {
        set({ shopsLoading: true, shopsError: null });

        try {
          await new Promise(resolve => setTimeout(resolve, 300));

          const shops = mockProducts.map(p => p.shop);
          set({
            shops,
            shopsLoading: false,
          });
        } catch (error) {
          set({
            shopsLoading: false,
            shopsError: error instanceof Error ? error.message : '获取店铺失败',
          });
        }
      },

      // 获取店铺详情
      fetchShopDetail: async (shopId: string) => {
        set({ shopsLoading: true, shopsError: null });

        try {
          await new Promise(resolve => setTimeout(resolve, 300));

          const shop = mockProducts.find(p => p.shopId === shopId)?.shop;
          if (!shop) {
            throw new Error('店铺不存在');
          }

          set({
            currentShop: shop,
            shopsLoading: false,
          });
        } catch (error) {
          set({
            shopsLoading: false,
            shopsError:
              error instanceof Error ? error.message : '获取店铺详情失败',
          });
        }
      },

      // 搜索商品
      searchProducts: async (
        keyword: string,
        params: Partial<ProductSearchParams> = {}
      ) => {
        const searchParams = { ...params, keyword };

        // 添加到搜索历史
        get().addSearchHistory(keyword);

        // 执行搜索
        await get().fetchProducts(searchParams);
      },

      // 添加搜索历史
      addSearchHistory: (keyword: string) => {
        const { searchHistory } = get();
        const newHistory = [
          keyword,
          ...searchHistory.filter(h => h !== keyword),
        ].slice(0, CACHE_CONFIG.MAX_SEARCH_HISTORY);

        set({ searchHistory: newHistory });
      },

      // 清除搜索历史
      clearSearchHistory: () => {
        set({ searchHistory: [] });
      },

      // 添加到收藏
      addToFavorites: async (productId: string) => {
        try {
          await new Promise(resolve => setTimeout(resolve, 200));

          const { favorites } = get();
          const newFavorite: ProductFavorite = {
            id: Date.now().toString(),
            productId,
            userId: '1', // 假设用户ID
            createdAt: new Date().toISOString(),
          };

          set({ favorites: [...favorites, newFavorite] });
        } catch (error) {
          throw new Error('添加收藏失败');
        }
      },

      // 取消收藏
      removeFromFavorites: async (productId: string) => {
        try {
          await new Promise(resolve => setTimeout(resolve, 200));

          const { favorites } = get();
          const newFavorites = favorites.filter(f => f.productId !== productId);

          set({ favorites: newFavorites });
        } catch (error) {
          throw new Error('取消收藏失败');
        }
      },

      // 获取收藏列表
      fetchFavorites: async () => {
        try {
          await new Promise(resolve => setTimeout(resolve, 300));

          // 模拟获取收藏列表
          set({ favorites: [] });
        } catch (error) {
          throw new Error('获取收藏列表失败');
        }
      },

      // 添加到浏览历史
      addToHistory: (product: Product) => {
        const { viewHistory } = get();
        const newHistory = [
          {
            id: Date.now().toString(),
            productId: product.id,
            product,
            userId: '1',
            viewedAt: new Date().toISOString(),
          },
          ...viewHistory.filter(h => h.productId !== product.id),
        ].slice(0, CACHE_CONFIG.MAX_HISTORY_ITEMS);

        set({ viewHistory: newHistory });
      },

      // 清除浏览历史
      clearHistory: () => {
        set({ viewHistory: [] });
      },

      // 获取推荐商品
      fetchRecommendations: async (
        params: ProductRecommendationParams
      ): Promise<Product[]> => {
        await new Promise(resolve => setTimeout(resolve, 300));

        // 模拟推荐逻辑
        const { limit = 10 } = params;
        return mockProducts.slice(0, limit);
      },

      // 设置搜索参数
      setSearchParams: (params: Partial<ProductSearchParams>) => {
        const { searchParams } = get();
        set({ searchParams: { ...searchParams, ...params } });
      },

      // 清除商品列表
      clearProducts: () => {
        set({
          products: [],
          productListPagination: null,
          productListError: null,
        });
      },

      // 清除当前商品
      clearCurrentProduct: () => {
        set({
          currentProduct: null,
          relatedProducts: [],
          productDetailError: null,
        });
      },

      // 更新列表中的商品
      updateProductInList: (productId: string, updates: Partial<Product>) => {
        const { products } = get();
        const newProducts = products.map(p =>
          p.id === productId ? { ...p, ...updates } : p
        );

        set({ products: newProducts });

        // 更新缓存
        const updatedProduct = newProducts.find(p => p.id === productId);
        if (updatedProduct) {
          get().setCachedProduct(updatedProduct);
        }
      },

      // 清除缓存
      clearCache: () => {
        set({
          cache: {
            products: new Map(),
            categories: new Map(),
            shops: new Map(),
          },
        });
      },

      // 获取缓存的商品
      getCachedProduct: (productId: string): Product | null => {
        const { cache } = get();
        const cached = cache.products.get(productId);

        if (!cached) return null;

        const now = Date.now();
        if (now - cached.timestamp > CACHE_CONFIG.PRODUCT_TTL) {
          cache.products.delete(productId);
          return null;
        }

        return cached.data;
      },

      // 设置缓存的商品
      setCachedProduct: (product: Product) => {
        const { cache } = get();
        cache.products.set(product.id, {
          data: product,
          timestamp: Date.now(),
        });
      },
    }),
    {
      name: 'taobei-product-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        searchHistory: state.searchHistory,
        favorites: state.favorites,
        viewHistory: state.viewHistory,
      }),
    }
  )
);

// 导出选择器
export const selectProducts = (state: ProductState) => state.products;
export const selectCurrentProduct = (state: ProductState) =>
  state.currentProduct;
export const selectCategories = (state: ProductState) => state.categories;
export const selectSearchParams = (state: ProductState) => state.searchParams;
export const selectFavorites = (state: ProductState) => state.favorites;
export const selectViewHistory = (state: ProductState) => state.viewHistory;
export const selectProductListLoading = (state: ProductState) =>
  state.productListLoading;
export const selectProductDetailLoading = (state: ProductState) =>
  state.productDetailLoading;
