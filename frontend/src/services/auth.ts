// 用户认证API服务
// 提供登录、注册、验证码、密码重置等认证相关的API调用

import { BaseService } from './BaseService';
import { apiClient } from './api';
import {
  User,
  UserProfile,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  SendCodeRequest,
  SendCodeResponse,
  VerifyCodeRequest,
  VerifyCodeResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ChangePasswordRequest,
  UpdateProfileRequest,
  ApiResponse,
} from '../types/user';

/**
 * 认证API服务类
 */
export class AuthService extends BaseService {
  constructor() {
    super('/auth');
  }

  /**
   * 用户登录
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.post<LoginResponse>('/login', credentials);

    // 登录成功后设置token
    if (response.success && response.data) {
      const { accessToken, refreshToken } = response.data;
      apiClient.setAuthToken(accessToken);
      apiClient.setRefreshToken(refreshToken);

      // 存储到localStorage
      this.storeAuthData(response.data);
    }

    return response.data;
  }

  /**
   * 用户注册
   */
  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    const response = await this.post<RegisterResponse>('/register', userData);

    // 注册成功后自动登录
    if (response.success && response.data) {
      const { accessToken, refreshToken } = response.data;
      if (accessToken && refreshToken) {
        apiClient.setAuthToken(accessToken);
        apiClient.setRefreshToken(refreshToken);
        this.storeAuthData(response.data);
      }
    }

    return response.data;
  }

  /**
   * 发送验证码
   */
  async sendCode(request: SendCodeRequest): Promise<SendCodeResponse> {
    const response = await this.post<SendCodeResponse>('/send-code', request);
    return response.data;
  }

  /**
   * 验证验证码
   */
  async verifyCode(request: VerifyCodeRequest): Promise<VerifyCodeResponse> {
    const response = await this.post<VerifyCodeResponse>(
      '/verify-code',
      request
    );
    return response.data;
  }

  /**
   * 重置密码
   */
  async resetPassword(
    request: ResetPasswordRequest
  ): Promise<ResetPasswordResponse> {
    const response = await this.post<ResetPasswordResponse>(
      '/reset-password',
      request
    );
    return response.data;
  }

  /**
   * 修改密码
   */
  async changePassword(
    request: ChangePasswordRequest
  ): Promise<ApiResponse<null>> {
    const response = await this.put<ApiResponse<null>>(
      '/change-password',
      request
    );
    return response.data;
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<User>(`${this.baseUrl}/me`);

      // 更新本地存储的用户信息
      if (response.success && response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }

      return response.data;
    } catch (error) {
      console.error('[AuthService] Get current user failed:', error);
      throw this.handleAuthError(error, '获取用户信息失败');
    }
  }

  /**
   * 获取用户信息
   */
  async getUserProfile(): Promise<UserProfile> {
    const response = await this.get<UserProfile>('/profile');
    return response.data;
  }

  /**
   * 更新用户资料
   */
  async updateProfile(request: UpdateProfileRequest): Promise<UserProfile> {
    const response = await this.put<UserProfile>('/profile', request);

    // 更新本地存储的用户信息
    if (response.success && response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }

    return response.data;
  }

  /**
   * 上传头像
   */
  async uploadAvatar(file: File): Promise<string> {
    try {
      const response = await apiClient.upload<{ avatarUrl: string }>(
        `${this.baseUrl}/avatar`,
        file,
        progressEvent => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`[AuthService] Avatar upload progress: ${progress}%`);
        }
      );

      // 更新本地存储的用户头像
      if (response.success && response.data) {
        const currentUser = this.getCurrentUserFromStorage();
        if (currentUser && currentUser.profile) {
          currentUser.profile.avatar = response.data.avatarUrl;
          localStorage.setItem('user', JSON.stringify(currentUser));
        }
      }

      return response.data.avatarUrl;
    } catch (error) {
      console.error('[AuthService] Upload avatar failed:', error);
      throw this.handleAuthError(error, '上传头像失败');
    }
  }

  /**
   * 刷新访问令牌
   */
  async refreshToken(): Promise<string> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await this.post<{ accessToken: string }>('/refresh', {
        refreshToken,
      });
      const { accessToken } = response.data;

      // 更新token
      apiClient.setAuthToken(accessToken);
      localStorage.setItem('accessToken', accessToken);

      return accessToken;
    } catch (error) {
      // 刷新失败，清除认证数据
      this.clearAuthData();
      throw error;
    }
  }

  /**
   * 用户登出
   */
  async logout(): Promise<void> {
    try {
      // 调用后端登出接口
      await this.post('/logout');
    } catch (error) {
      console.error('[AuthService] Logout failed:', error);
      // 即使后端登出失败，也要清除本地数据
    } finally {
      // 清除本地存储
      this.clearAuthData();
    }
  }

  /**
   * 检查认证状态
   */
  async checkAuthStatus(): Promise<boolean> {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        return false;
      }

      // 验证token有效性
      await this.getCurrentUser();
      return true;
    } catch (error) {
      console.error('[AuthService] Check auth status failed:', error);
      // token无效，清除认证信息
      this.clearAuthData();
      return false;
    }
  }

  /**
   * 初始化认证状态
   */
  initializeAuth(): boolean {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      const userStr = localStorage.getItem('user');

      if (accessToken && refreshToken && userStr) {
        apiClient.setAuthToken(accessToken);
        apiClient.setRefreshToken(refreshToken);
        return true;
      }

      return false;
    } catch (error) {
      console.error('[AuthService] Initialize auth failed:', error);
      this.clearAuthData();
      return false;
    }
  }

  /**
   * 获取本地存储的用户信息
   */
  getCurrentUserFromStorage(): User | null {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('[AuthService] Get user from storage failed:', error);
      return null;
    }
  }

  /**
   * 获取访问令牌
   */
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /**
   * 获取刷新令牌
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  /**
   * 存储认证数据
   */
  private storeAuthData(data: LoginResponse | RegisterResponse): void {
    const { accessToken, refreshToken, user } = data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
  }

  /**
   * 清除认证数据
   */
  private clearAuthData(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    apiClient.clearAuth();
  }

  /**
   * 处理认证错误
   */
  private handleAuthError(error: any, defaultMessage: string): ApiError {
    if (error instanceof ApiError) {
      return error;
    }

    return new ApiError(
      error.message || defaultMessage,
      error.type || 'AUTH_ERROR',
      error.status,
      error.code,
      error.data
    );
  }

  /**
   * 验证邮箱格式
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * 验证手机号格式
   */
  validatePhone(phone: string): boolean {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  }

  /**
   * 验证密码强度
   */
  validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('密码长度至少8位');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('密码必须包含小写字母');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('密码必须包含大写字母');
    }

    if (!/\d/.test(password)) {
      errors.push('密码必须包含数字');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('密码必须包含特殊字符');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 生成随机密码
   */
  generateRandomPassword(length: number = 12): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*(),.?":{}|<>';
    const allChars = lowercase + uppercase + numbers + symbols;

    let password = '';

    // 确保包含每种类型的字符
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // 填充剩余长度
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // 打乱字符顺序
    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }
}

// 创建认证服务实例
export const authService = new AuthService();

// 导出便捷方法
export const auth = {
  login: (credentials: LoginRequest) => authService.login(credentials),
  register: (userData: RegisterRequest) => authService.register(userData),
  sendCode: (request: SendCodeRequest) =>
    authService.sendVerificationCode(request),
  verifyCode: (request: VerifyCodeRequest) => authService.verifyCode(request),
  resetPassword: (request: ResetPasswordRequest) =>
    authService.resetPassword(request),
  changePassword: (request: ChangePasswordRequest) =>
    authService.changePassword(request),
  getCurrentUser: () => authService.getCurrentUser(),
  updateProfile: (request: UpdateProfileRequest) =>
    authService.updateProfile(request),
  uploadAvatar: (file: File) => authService.uploadAvatar(file),
  refreshToken: () => authService.refreshToken(),
  logout: () => authService.logout(),
  checkAuthStatus: () => authService.checkAuthStatus(),
  initializeAuth: () => authService.initializeAuth(),
  getCurrentUserFromStorage: () => authService.getCurrentUserFromStorage(),
  getAccessToken: () => authService.getAccessToken(),
  getRefreshToken: () => authService.getRefreshToken(),
};

// 导出验证工具
export const authValidators = {
  validateEmail: (email: string) => authService.validateEmail(email),
  validatePhone: (phone: string) => authService.validatePhone(phone),
  validatePassword: (password: string) =>
    authService.validatePassword(password),
  generateRandomPassword: (length?: number) =>
    authService.generateRandomPassword(length),
};
