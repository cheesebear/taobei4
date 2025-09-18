// 导出所有类型定义
export * from './api';
export * from './user';
export * from './product';
export * from './cart';
export * from './order';
export * from './common';

// 自定义工具类型
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

export type ID = string | number;

export type Timestamp = string | number | Date;

// 元编程类型
export type Eval<T> = T extends (...args: any[]) => infer R ? R : T;

export type Apply<F, A> = F extends (...args: any[]) => infer R ? R : never;

export type Bind<F, T> = F extends (this: any, ...args: infer A) => infer R
  ? (this: T, ...args: A) => R
  : never;

export type Call<F, T, A> = F extends (this: any, ...args: any[]) => infer R
  ? R
  : never;

// 常量定义
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  USERS: '/api/users',
  PRODUCTS: '/api/products',
  CART: '/api/cart',
  ORDERS: '/api/orders',
} as const;

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: '登录成功',
  LOGOUT_SUCCESS: '退出成功',
  REGISTER_SUCCESS: '注册成功',
  UPDATE_SUCCESS: '更新成功',
  DELETE_SUCCESS: '删除成功',
} as const;

export const ERROR_MESSAGES = {
  LOGIN_FAILED: '登录失败',
  REGISTER_FAILED: '注册失败',
  UPDATE_FAILED: '更新失败',
  DELETE_FAILED: '删除失败',
  NETWORK_ERROR: '网络错误',
} as const;

export const CONFIG = {
  API_BASE_URL: process.env.VITE_API_BASE_URL || 'http://localhost:3000',
  APP_NAME: 'Taobei',
  VERSION: '1.0.0',
} as const;

// 默认值
export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
  total: 0,
};

export const DEFAULT_SORT = {
  field: 'createdAt',
  order: 'desc' as const,
};

export const DEFAULT_SEARCH_PARAMS = {
  query: '',
  filters: {},
  sort: DEFAULT_SORT,
  pagination: DEFAULT_PAGINATION,
};

// 类型守卫函数
export function isApiError(obj: any): obj is { code: string; message: string } {
  return obj && typeof obj.code === 'string' && typeof obj.message === 'string';
}

export function isApiResponse<T>(
  obj: any
): obj is { data: T; success: boolean } {
  return obj && typeof obj.success === 'boolean' && 'data' in obj;
}

export function isPaginatedResponse<T>(
  obj: any
): obj is { data: T[]; total: number; page: number; limit: number } {
  return obj && Array.isArray(obj.data) && typeof obj.total === 'number';
}

export function isBaseEntity(
  obj: any
): obj is { id: ID; createdAt: Timestamp; updatedAt: Timestamp } {
  return obj && 'id' in obj && 'createdAt' in obj && 'updatedAt' in obj;
}

export function isUser(obj: any): boolean {
  return (
    obj && typeof obj.username === 'string' && typeof obj.email === 'string'
  );
}

export function isProduct(obj: any): boolean {
  return obj && typeof obj.name === 'string' && typeof obj.price === 'number';
}

export function isCartItem(obj: any): boolean {
  return obj && 'productId' in obj && typeof obj.quantity === 'number';
}

// 转换函数
export function toApiResponse<T>(data: T): { data: T; success: boolean } {
  return { data, success: true };
}

export function toApiError(
  code: string,
  message: string
): { code: string; message: string; success: boolean } {
  return { code, message, success: false };
}

export function toPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) {
  return { data, total, page, limit, success: true };
}

// 默认导出
export default {
  // 常量
  LOADING_STATES,
  HTTP_STATUS,
  API_ENDPOINTS,
  ERROR_CODES,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  CONFIG,

  // 默认值
  DEFAULT_PAGINATION,
  DEFAULT_SORT,
  DEFAULT_SEARCH_PARAMS,

  // 工具函数
  isApiError,
  isApiResponse,
  isPaginatedResponse,
  isBaseEntity,
  isUser,
  isProduct,
  isCartItem,
  toApiResponse,
  toApiError,
  toPaginatedResponse,
};
