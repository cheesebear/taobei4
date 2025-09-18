// 用户相关类型定义
// 基于data-model.md中的User实体

/**
 * 用户基础信息
 */
export interface User {
  id: string;
  phone: string;
  username: string;
  avatar?: string;
  email?: string;
  gender?: 'male' | 'female' | 'unknown';
  birthday?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  status: 'active' | 'inactive' | 'banned';
}

/**
 * 用户详细资料
 */
export interface UserProfile extends User {
  nickname?: string;
  realName?: string;
  idCard?: string;
  addresses: UserAddress[];
  preferences: UserPreferences;
  statistics: UserStatistics;
}

/**
 * 用户地址信息
 */
export interface UserAddress {
  id: string;
  userId: string;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  address: string;
  postalCode?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 用户偏好设置
 */
export interface UserPreferences {
  language: 'zh-CN' | 'en-US';
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  privacy: {
    showPhone: boolean;
    showEmail: boolean;
    allowRecommendation: boolean;
  };
}

/**
 * 用户统计信息
 */
export interface UserStatistics {
  totalOrders: number;
  totalSpent: number;
  totalSaved: number;
  favoriteCount: number;
  reviewCount: number;
  memberLevel: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  points: number;
}

/**
 * 登录请求
 */
export interface LoginRequest {
  phone: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * 注册请求
 */
export interface RegisterRequest {
  phone: string;
  password: string;
  confirmPassword: string;
  verificationCode: string;
  username?: string;
  agreementAccepted: boolean;
}

/**
 * 验证码请求
 */
export interface VerificationCodeRequest {
  phone: string;
  type: 'register' | 'login' | 'reset_password' | 'change_phone';
}

/**
 * 重置密码请求
 */
export interface ResetPasswordRequest {
  phone: string;
  newPassword: string;
  confirmPassword: string;
  verificationCode: string;
}

/**
 * 修改密码请求
 */
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * 更新用户信息请求
 */
export interface UpdateUserRequest {
  username?: string;
  nickname?: string;
  avatar?: string;
  email?: string;
  gender?: 'male' | 'female' | 'unknown';
  birthday?: string;
}

/**
 * 认证响应
 */
export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * JWT Token载荷
 */
export interface JWTPayload {
  userId: string;
  phone: string;
  username: string;
  iat: number;
  exp: number;
}

/**
 * 用户会话信息
 */
export interface UserSession {
  user: User;
  token: string;
  refreshToken: string;
  expiresAt: number;
  isAuthenticated: boolean;
}

/**
 * API响应基础类型
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * 用户状态枚举
 */
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned',
}

/**
 * 性别枚举
 */
export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  UNKNOWN = 'unknown',
}

/**
 * 会员等级枚举
 */
export enum MemberLevel {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
  DIAMOND = 'diamond',
}

/**
 * 验证码类型枚举
 */
export enum VerificationCodeType {
  REGISTER = 'register',
  LOGIN = 'login',
  RESET_PASSWORD = 'reset_password',
  CHANGE_PHONE = 'change_phone',
}
