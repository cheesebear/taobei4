// API相关类型定义

/**
 * HTTP请求方法
 */
export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'PATCH'
  | 'HEAD'
  | 'OPTIONS';

/**
 * API请求配置
 */
export interface ApiRequestConfig {
  url: string;
  method: HttpMethod;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
  timeout?: number;
  withCredentials?: boolean;
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer';
}

/**
 * API响应数据
 */
export interface ApiResponseData<T = any> {
  data: T;
  success: boolean;
  message?: string;
  code?: string;
  timestamp?: string;
}

/**
 * API错误响应
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  code: string;
  details?: any;
  timestamp?: string;
}

/**
 * 分页请求参数
 */
export interface PaginationRequest {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * 分页响应数据
 */
export interface PaginationResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * 搜索请求参数
 */
export interface SearchRequest extends PaginationRequest {
  query?: string;
  filters?: Record<string, any>;
}

/**
 * 批量操作请求
 */
export interface BatchRequest<T = any> {
  action: 'create' | 'update' | 'delete';
  items: T[];
}

/**
 * 批量操作响应
 */
export interface BatchResponse<T = any> {
  success: T[];
  failed: Array<{
    item: T;
    error: string;
  }>;
  total: number;
  successCount: number;
  failedCount: number;
}

/**
 * 文件上传请求
 */
export interface UploadRequest {
  file: File;
  filename?: string;
  folder?: string;
  metadata?: Record<string, any>;
}

/**
 * 文件上传响应
 */
export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

/**
 * API端点配置
 */
export interface ApiEndpoint {
  path: string;
  method: HttpMethod;
  auth?: boolean;
  timeout?: number;
  retries?: number;
}

/**
 * API客户端配置
 */
export interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  headers: Record<string, string>;
  interceptors?: {
    request?: (config: ApiRequestConfig) => ApiRequestConfig;
    response?: (response: any) => any;
    error?: (error: any) => any;
  };
}

/**
 * 认证相关API类型
 */
export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    email: string;
    avatar?: string;
    roles: string[];
  };
  expiresAt: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  inviteCode?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * 用户相关API类型
 */
export interface UpdateProfileRequest {
  username?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
}

export interface UserPreferencesRequest {
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
  timezone?: string;
  notifications?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

/**
 * 商品相关API类型
 */
export interface ProductSearchRequest extends SearchRequest {
  category?: string;
  brand?: string;
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  featured?: boolean;
}

export interface ProductCreateRequest {
  name: string;
  description: string;
  price: number;
  category: string;
  brand?: string;
  images: string[];
  specifications?: Record<string, any>;
  inventory: {
    quantity: number;
    sku: string;
    trackInventory: boolean;
  };
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

export interface ProductUpdateRequest extends Partial<ProductCreateRequest> {
  id: string;
}

/**
 * 购物车相关API类型
 */
export interface AddToCartRequest {
  productId: string;
  quantity: number;
  specifications?: Record<string, any>;
}

export interface UpdateCartItemRequest {
  itemId: string;
  quantity: number;
}

export interface CartSyncRequest {
  items: Array<{
    productId: string;
    quantity: number;
    specifications?: Record<string, any>;
  }>;
}

/**
 * 订单相关API类型
 */
export interface CreateOrderRequest {
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
  };
  paymentMethod: string;
  couponCode?: string;
  notes?: string;
}

export interface OrderSearchRequest extends SearchRequest {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
}

/**
 * 支付相关API类型
 */
export interface PaymentRequest {
  orderId: string;
  paymentMethod: string;
  amount: number;
  currency: string;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface PaymentResponse {
  paymentId: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentUrl?: string;
  qrCode?: string;
  expiresAt?: string;
}

/**
 * 系统相关API类型
 */
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  version: string;
  services: Record<
    string,
    {
      status: 'up' | 'down';
      responseTime?: number;
      error?: string;
    }
  >;
}

export interface SystemConfigResponse {
  app: {
    name: string;
    version: string;
    environment: string;
  };
  features: Record<string, boolean>;
  limits: {
    maxFileSize: number;
    maxRequestSize: number;
    rateLimit: number;
  };
  maintenance: {
    enabled: boolean;
    message?: string;
    scheduledAt?: string;
  };
}

/**
 * 统计相关API类型
 */
export interface AnalyticsRequest {
  startDate: string;
  endDate: string;
  metrics: string[];
  groupBy?: 'day' | 'week' | 'month';
  filters?: Record<string, any>;
}

export interface AnalyticsResponse {
  data: Array<{
    date: string;
    metrics: Record<string, number>;
  }>;
  summary: Record<string, number>;
  period: {
    start: string;
    end: string;
  };
}

/**
 * WebSocket相关类型
 */
export interface WebSocketMessage<T = any> {
  type: string;
  data: T;
  timestamp: string;
  id?: string;
}

export interface WebSocketConfig {
  url: string;
  protocols?: string[];
  reconnect: boolean;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeat: {
    enabled: boolean;
    interval: number;
    message: string;
  };
}

/**
 * 缓存相关类型
 */
export interface CacheConfig {
  ttl: number;
  maxSize: number;
  strategy: 'lru' | 'fifo' | 'lfu';
}

export interface CacheEntry<T = any> {
  key: string;
  value: T;
  expiresAt: number;
  createdAt: number;
  accessCount: number;
  lastAccessed: number;
}

/**
 * 错误处理类型
 */
export interface ApiErrorHandler {
  (error: ApiErrorResponse): void;
}

export interface RetryConfig {
  attempts: number;
  delay: number;
  backoff: 'linear' | 'exponential';
  retryCondition: (error: any) => boolean;
}

/**
 * 类型守卫函数
 */
export function isApiResponse<T>(obj: any): obj is ApiResponseData<T> {
  return obj && typeof obj.success === 'boolean' && 'data' in obj;
}

export function isApiError(obj: any): obj is ApiErrorResponse {
  return obj && obj.success === false && typeof obj.message === 'string';
}

export function isPaginationResponse<T>(
  obj: any
): obj is PaginationResponse<T> {
  return obj && Array.isArray(obj.data) && typeof obj.total === 'number';
}

export function isUploadResponse(obj: any): obj is UploadResponse {
  return obj && typeof obj.url === 'string' && typeof obj.filename === 'string';
}

/**
 * 默认配置
 */
export const DEFAULT_API_CONFIG: ApiClientConfig = {
  baseURL: process.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
};

export const DEFAULT_PAGINATION: PaginationRequest = {
  page: 1,
  limit: 20,
  sort: 'createdAt',
  order: 'desc',
};

export const DEFAULT_CACHE_CONFIG: CacheConfig = {
  ttl: 5 * 60 * 1000, // 5分钟
  maxSize: 100,
  strategy: 'lru',
};

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  attempts: 3,
  delay: 1000,
  backoff: 'exponential',
  retryCondition: error => {
    return error.code >= 500 || error.code === 0; // 服务器错误或网络错误
  },
};
