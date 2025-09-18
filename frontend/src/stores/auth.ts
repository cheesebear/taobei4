// 用户认证状态管理
// 使用Zustand管理认证状态

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  User,
  UserSession,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  VerificationCodeRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  UpdateUserRequest,
} from '../types/user';

/**
 * 认证状态接口
 */
interface AuthState {
  // 状态
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // 会话信息
  session: UserSession | null;
  expiresAt: number | null;

  // 操作方法
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  updateUser: (data: UpdateUserRequest) => Promise<void>;
  changePassword: (data: ChangePasswordRequest) => Promise<void>;
  resetPassword: (data: ResetPasswordRequest) => Promise<void>;
  sendVerificationCode: (data: VerificationCodeRequest) => Promise<void>;

  // 工具方法
  setUser: (user: User) => void;
  setToken: (token: string, refreshToken?: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearAuth: () => void;
  checkTokenExpiry: () => boolean;
  initializeAuth: () => void;
}

/**
 * 本地存储键
 */
const STORAGE_KEYS = {
  AUTH_STORAGE: 'taobei-auth-storage',
  TOKEN: 'taobei-token',
  REFRESH_TOKEN: 'taobei-refresh-token',
  USER: 'taobei-user',
} as const;

/**
 * 模拟API调用 - 登录
 */
const mockLogin = async (credentials: LoginRequest): Promise<AuthResponse> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 模拟登录验证
  if (
    credentials.phone === '13800138000' &&
    credentials.password === '123456'
  ) {
    const user: User = {
      id: '1',
      phone: credentials.phone,
      username: '测试用户',
      avatar: 'https://via.placeholder.com/100x100',
      email: 'test@example.com',
      gender: 'unknown',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      status: 'active',
    };

    return {
      user,
      token: 'mock-jwt-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now(),
      expiresIn: 3600, // 1小时
    };
  }

  throw new Error('手机号或密码错误');
};

/**
 * 模拟API调用 - 注册
 */
const mockRegister = async (data: RegisterRequest): Promise<AuthResponse> => {
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 模拟注册验证
  if (data.password !== data.confirmPassword) {
    throw new Error('两次输入的密码不一致');
  }

  if (data.verificationCode !== '123456') {
    throw new Error('验证码错误');
  }

  if (!data.agreementAccepted) {
    throw new Error('请同意用户协议');
  }

  const user: User = {
    id: '2',
    phone: data.phone,
    username: data.username || '新用户',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'active',
  };

  return {
    user,
    token: 'mock-jwt-token-' + Date.now(),
    refreshToken: 'mock-refresh-token-' + Date.now(),
    expiresIn: 3600,
  };
};

/**
 * 模拟API调用 - 发送验证码
 */
const mockSendVerificationCode = async (
  data: VerificationCodeRequest
): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));

  // 模拟发送成功
  console.log(`验证码已发送到 ${data.phone}，类型：${data.type}`);
};

/**
 * 模拟API调用 - 刷新token
 */
const mockRefreshToken = async (
  refreshToken: string
): Promise<AuthResponse> => {
  await new Promise(resolve => setTimeout(resolve, 500));

  // 模拟刷新成功
  return {
    user: JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || 'null'),
    token: 'mock-jwt-token-refreshed-' + Date.now(),
    refreshToken: 'mock-refresh-token-refreshed-' + Date.now(),
    expiresIn: 3600,
  };
};

/**
 * 创建认证状态管理
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 初始状态
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      session: null,
      expiresAt: null,

      // 登录
      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });

        try {
          const response = await mockLogin(credentials);
          const expiresAt = Date.now() + response.expiresIn * 1000;

          const session: UserSession = {
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken,
            expiresAt,
            isAuthenticated: true,
          };

          set({
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            session,
            expiresAt,
            isLoading: false,
            error: null,
          });

          // 存储到localStorage
          localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
          localStorage.setItem(
            STORAGE_KEYS.REFRESH_TOKEN,
            response.refreshToken
          );
          localStorage.setItem(
            STORAGE_KEYS.USER,
            JSON.stringify(response.user)
          );
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : '登录失败',
          });
          throw error;
        }
      },

      // 注册
      register: async (data: RegisterRequest) => {
        set({ isLoading: true, error: null });

        try {
          const response = await mockRegister(data);
          const expiresAt = Date.now() + response.expiresIn * 1000;

          const session: UserSession = {
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken,
            expiresAt,
            isAuthenticated: true,
          };

          set({
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            session,
            expiresAt,
            isLoading: false,
            error: null,
          });

          // 存储到localStorage
          localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
          localStorage.setItem(
            STORAGE_KEYS.REFRESH_TOKEN,
            response.refreshToken
          );
          localStorage.setItem(
            STORAGE_KEYS.USER,
            JSON.stringify(response.user)
          );
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : '注册失败',
          });
          throw error;
        }
      },

      // 登出
      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          session: null,
          expiresAt: null,
          error: null,
        });

        // 清除localStorage
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
      },

      // 刷新认证
      refreshAuth: async () => {
        const { refreshToken } = get();

        if (!refreshToken) {
          throw new Error('没有刷新令牌');
        }

        try {
          const response = await mockRefreshToken(refreshToken);
          const expiresAt = Date.now() + response.expiresIn * 1000;

          const session: UserSession = {
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken,
            expiresAt,
            isAuthenticated: true,
          };

          set({
            token: response.token,
            refreshToken: response.refreshToken,
            session,
            expiresAt,
          });

          // 更新localStorage
          localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
          localStorage.setItem(
            STORAGE_KEYS.REFRESH_TOKEN,
            response.refreshToken
          );
        } catch (error) {
          // 刷新失败，清除认证状态
          get().logout();
          throw error;
        }
      },

      // 更新用户信息
      updateUser: async (data: UpdateUserRequest) => {
        set({ isLoading: true, error: null });

        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 500));

          const { user } = get();
          if (!user) throw new Error('用户未登录');

          const updatedUser: User = {
            ...user,
            ...data,
            updatedAt: new Date().toISOString(),
          };

          set({
            user: updatedUser,
            isLoading: false,
          });

          // 更新localStorage
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : '更新失败',
          });
          throw error;
        }
      },

      // 修改密码
      changePassword: async (data: ChangePasswordRequest) => {
        set({ isLoading: true, error: null });

        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 1000));

          if (data.newPassword !== data.confirmPassword) {
            throw new Error('两次输入的密码不一致');
          }

          // 模拟密码修改成功
          set({ isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : '修改密码失败',
          });
          throw error;
        }
      },

      // 重置密码
      resetPassword: async (data: ResetPasswordRequest) => {
        set({ isLoading: true, error: null });

        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 1000));

          if (data.newPassword !== data.confirmPassword) {
            throw new Error('两次输入的密码不一致');
          }

          if (data.verificationCode !== '123456') {
            throw new Error('验证码错误');
          }

          // 模拟重置成功
          set({ isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : '重置密码失败',
          });
          throw error;
        }
      },

      // 发送验证码
      sendVerificationCode: async (data: VerificationCodeRequest) => {
        set({ isLoading: true, error: null });

        try {
          await mockSendVerificationCode(data);
          set({ isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : '发送验证码失败',
          });
          throw error;
        }
      },

      // 工具方法
      setUser: (user: User) => set({ user }),

      setToken: (token: string, refreshToken?: string) => {
        const updates: Partial<AuthState> = { token };
        if (refreshToken) {
          updates.refreshToken = refreshToken;
        }
        set(updates);
      },

      setLoading: (isLoading: boolean) => set({ isLoading }),

      setError: (error: string | null) => set({ error }),

      clearAuth: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          session: null,
          expiresAt: null,
          error: null,
        });
      },

      checkTokenExpiry: () => {
        const { expiresAt } = get();
        if (!expiresAt) return false;

        const now = Date.now();
        const timeUntilExpiry = expiresAt - now;

        // 如果还有5分钟过期，返回true表示需要刷新
        return timeUntilExpiry < 5 * 60 * 1000;
      },

      initializeAuth: () => {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        const userStr = localStorage.getItem(STORAGE_KEYS.USER);

        if (token && refreshToken && userStr) {
          try {
            const user = JSON.parse(userStr);
            const session: UserSession = {
              user,
              token,
              refreshToken,
              expiresAt: Date.now() + 3600000, // 假设1小时有效期
              isAuthenticated: true,
            };

            set({
              user,
              token,
              refreshToken,
              isAuthenticated: true,
              session,
              expiresAt: session.expiresAt,
            });
          } catch (error) {
            console.error('初始化认证状态失败:', error);
            get().logout();
          }
        }
      },
    }),
    {
      name: STORAGE_KEYS.AUTH_STORAGE,
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        expiresAt: state.expiresAt,
      }),
    }
  )
);

// 自动初始化认证状态
if (typeof window !== 'undefined') {
  useAuthStore.getState().initializeAuth();
}

// 导出选择器
export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) =>
  state.isAuthenticated;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectError = (state: AuthState) => state.error;
export const selectSession = (state: AuthState) => state.session;
