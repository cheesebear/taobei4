import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAuthStore, selectUser, selectIsAuthenticated, selectIsLoading, selectError, selectSession } from '../../../src/stores/auth';
import type { LoginRequest, RegisterRequest, UpdateUserRequest, ChangePasswordRequest, ResetPasswordRequest, VerificationCodeRequest } from '../../../src/types/user';

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

// Mock console.log and console.error
const consoleMock = {
  log: vi.fn(),
  error: vi.fn()
};

Object.defineProperty(window, 'console', {
  value: consoleMock
});

describe('useAuthStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state
    useAuthStore.setState({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      session: null,
      expiresAt: null
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useAuthStore.getState();
      
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.session).toBeNull();
      expect(state.expiresAt).toBeNull();
    });
  });

  describe('login', () => {
    it('should login successfully with correct credentials', async () => {
      const credentials: LoginRequest = {
        phone: '13800138000',
        password: '123456'
      };

      const { login } = useAuthStore.getState();
      
      await login(credentials);
      
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toBeTruthy();
      expect(state.user?.phone).toBe(credentials.phone);
      expect(state.token).toBeTruthy();
      expect(state.refreshToken).toBeTruthy();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.session).toBeTruthy();
      expect(state.expiresAt).toBeTruthy();
      
      // Check localStorage calls
      expect(localStorageMock.setItem).toHaveBeenCalledWith('taobei-token', expect.any(String));
      expect(localStorageMock.setItem).toHaveBeenCalledWith('taobei-refresh-token', expect.any(String));
      expect(localStorageMock.setItem).toHaveBeenCalledWith('taobei-user', expect.any(String));
    });

    it('should handle login failure with incorrect credentials', async () => {
      const credentials: LoginRequest = {
        phone: '13800138000',
        password: 'wrong-password'
      };

      const { login } = useAuthStore.getState();
      
      await expect(login(credentials)).rejects.toThrow('手机号或密码错误');
      
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('手机号或密码错误');
    });

    it('should set loading state during login', async () => {
      const credentials: LoginRequest = {
        phone: '13800138000',
        password: '123456'
      };

      const { login } = useAuthStore.getState();
      
      // Start login (don't await)
      const loginPromise = login(credentials);
      
      // Check loading state immediately
      const loadingState = useAuthStore.getState();
      expect(loadingState.isLoading).toBe(true);
      expect(loadingState.error).toBeNull();
      
      // Wait for completion
      await loginPromise;
      
      const finalState = useAuthStore.getState();
      expect(finalState.isLoading).toBe(false);
    });
  });

  describe('register', () => {
    it('should register successfully with valid data', async () => {
      const registerData: RegisterRequest = {
        phone: '13900139000',
        password: '123456',
        confirmPassword: '123456',
        verificationCode: '123456',
        username: '新用户',
        agreementAccepted: true
      };

      const { register } = useAuthStore.getState();
      
      await register(registerData);
      
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toBeTruthy();
      expect(state.user?.phone).toBe(registerData.phone);
      expect(state.user?.username).toBe(registerData.username);
      expect(state.token).toBeTruthy();
      expect(state.refreshToken).toBeTruthy();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle registration failure with mismatched passwords', async () => {
      const registerData: RegisterRequest = {
        phone: '13900139000',
        password: '123456',
        confirmPassword: '654321',
        verificationCode: '123456',
        agreementAccepted: true
      };

      const { register } = useAuthStore.getState();
      
      await expect(register(registerData)).rejects.toThrow('两次输入的密码不一致');
      
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBe('两次输入的密码不一致');
    });

    it('should handle registration failure with wrong verification code', async () => {
      const registerData: RegisterRequest = {
        phone: '13900139000',
        password: '123456',
        confirmPassword: '123456',
        verificationCode: '000000',
        agreementAccepted: true
      };

      const { register } = useAuthStore.getState();
      
      await expect(register(registerData)).rejects.toThrow('验证码错误');
      
      const state = useAuthStore.getState();
      expect(state.error).toBe('验证码错误');
    });

    it('should handle registration failure without agreement acceptance', async () => {
      const registerData: RegisterRequest = {
        phone: '13900139000',
        password: '123456',
        confirmPassword: '123456',
        verificationCode: '123456',
        agreementAccepted: false
      };

      const { register } = useAuthStore.getState();
      
      await expect(register(registerData)).rejects.toThrow('请同意用户协议');
      
      const state = useAuthStore.getState();
      expect(state.error).toBe('请同意用户协议');
    });
  });

  describe('logout', () => {
    it('should clear all auth state and localStorage', () => {
      // Set some initial state
      useAuthStore.setState({
        user: { id: '1', phone: '13800138000', username: '测试用户' } as any,
        token: 'test-token',
        refreshToken: 'test-refresh-token',
        isAuthenticated: true,
        session: {} as any,
        expiresAt: Date.now() + 3600000
      });

      const { logout } = useAuthStore.getState();
      logout();
      
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.session).toBeNull();
      expect(state.expiresAt).toBeNull();
      expect(state.error).toBeNull();
      
      // Check localStorage cleanup
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('taobei-token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('taobei-refresh-token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('taobei-user');
    });
  });

  describe('refreshAuth', () => {
    it('should refresh auth successfully', async () => {
      // Set initial state with refresh token
      useAuthStore.setState({
        refreshToken: 'test-refresh-token',
        user: { id: '1', phone: '13800138000' } as any
      });
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ id: '1', phone: '13800138000' }));

      const { refreshAuth } = useAuthStore.getState();
      await refreshAuth();
      
      const state = useAuthStore.getState();
      expect(state.token).toBeTruthy();
      expect(state.refreshToken).toBeTruthy();
      expect(state.session).toBeTruthy();
      expect(state.expiresAt).toBeTruthy();
    });

    it('should throw error when no refresh token', async () => {
      useAuthStore.setState({ refreshToken: null });

      const { refreshAuth } = useAuthStore.getState();
      
      await expect(refreshAuth()).rejects.toThrow('没有刷新令牌');
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const initialUser = {
        id: '1',
        phone: '13800138000',
        username: '旧用户名',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        status: 'active' as const
      };
      
      useAuthStore.setState({ user: initialUser });

      const updateData: UpdateUserRequest = {
        username: '新用户名',
        email: 'new@example.com'
      };

      const { updateUser } = useAuthStore.getState();
      await updateUser(updateData);
      
      const state = useAuthStore.getState();
      expect(state.user?.username).toBe('新用户名');
      expect(state.user?.email).toBe('new@example.com');
      expect(state.user?.updatedAt).not.toBe(initialUser.updatedAt);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle update failure when user not logged in', async () => {
      useAuthStore.setState({ user: null });

      const { updateUser } = useAuthStore.getState();
      
      await expect(updateUser({ username: '新用户名' })).rejects.toThrow('用户未登录');
      
      const state = useAuthStore.getState();
      expect(state.error).toBe('用户未登录');
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const passwordData: ChangePasswordRequest = {
        currentPassword: 'old123456',
        newPassword: 'new123456',
        confirmPassword: 'new123456'
      };

      const { changePassword } = useAuthStore.getState();
      await changePassword(passwordData);
      
      const state = useAuthStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle password change failure with mismatched passwords', async () => {
      const passwordData: ChangePasswordRequest = {
        currentPassword: 'old123456',
        newPassword: 'new123456',
        confirmPassword: 'different123456'
      };

      const { changePassword } = useAuthStore.getState();
      
      await expect(changePassword(passwordData)).rejects.toThrow('两次输入的密码不一致');
      
      const state = useAuthStore.getState();
      expect(state.error).toBe('两次输入的密码不一致');
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const resetData: ResetPasswordRequest = {
        phone: '13800138000',
        verificationCode: '123456',
        newPassword: 'new123456',
        confirmPassword: 'new123456'
      };

      const { resetPassword } = useAuthStore.getState();
      await resetPassword(resetData);
      
      const state = useAuthStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle reset failure with wrong verification code', async () => {
      const resetData: ResetPasswordRequest = {
        phone: '13800138000',
        verificationCode: '000000',
        newPassword: 'new123456',
        confirmPassword: 'new123456'
      };

      const { resetPassword } = useAuthStore.getState();
      
      await expect(resetPassword(resetData)).rejects.toThrow('验证码错误');
      
      const state = useAuthStore.getState();
      expect(state.error).toBe('验证码错误');
    });
  });

  describe('sendVerificationCode', () => {
    it('should send verification code successfully', async () => {
      const codeData: VerificationCodeRequest = {
        phone: '13800138000',
        type: 'register'
      };

      const { sendVerificationCode } = useAuthStore.getState();
      await sendVerificationCode(codeData);
      
      const state = useAuthStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      
      expect(consoleMock.log).toHaveBeenCalledWith(
        expect.stringContaining('验证码已发送到 13800138000')
      );
    });
  });

  describe('utility methods', () => {
    it('should set user', () => {
      const user = { id: '1', phone: '13800138000', username: '测试用户' } as any;
      
      const { setUser } = useAuthStore.getState();
      setUser(user);
      
      const state = useAuthStore.getState();
      expect(state.user).toBe(user);
    });

    it('should set token', () => {
      const { setToken } = useAuthStore.getState();
      setToken('new-token', 'new-refresh-token');
      
      const state = useAuthStore.getState();
      expect(state.token).toBe('new-token');
      expect(state.refreshToken).toBe('new-refresh-token');
    });

    it('should set loading state', () => {
      const { setLoading } = useAuthStore.getState();
      setLoading(true);
      
      const state = useAuthStore.getState();
      expect(state.isLoading).toBe(true);
    });

    it('should set error', () => {
      const { setError } = useAuthStore.getState();
      setError('测试错误');
      
      const state = useAuthStore.getState();
      expect(state.error).toBe('测试错误');
    });

    it('should clear auth', () => {
      // Set some initial state
      useAuthStore.setState({
        user: { id: '1' } as any,
        token: 'token',
        refreshToken: 'refresh-token',
        isAuthenticated: true,
        session: {} as any,
        expiresAt: Date.now(),
        error: 'some error'
      });

      const { clearAuth } = useAuthStore.getState();
      clearAuth();
      
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.session).toBeNull();
      expect(state.expiresAt).toBeNull();
      expect(state.error).toBeNull();
    });

    it('should check token expiry correctly', () => {
      const { checkTokenExpiry } = useAuthStore.getState();
      
      // No expiry time
      useAuthStore.setState({ expiresAt: null });
      expect(checkTokenExpiry()).toBe(false);
      
      // Token expires in 10 minutes (should not need refresh)
      useAuthStore.setState({ expiresAt: Date.now() + 10 * 60 * 1000 });
      expect(checkTokenExpiry()).toBe(false);
      
      // Token expires in 3 minutes (should need refresh)
      useAuthStore.setState({ expiresAt: Date.now() + 3 * 60 * 1000 });
      expect(checkTokenExpiry()).toBe(true);
    });
  });

  describe('initializeAuth', () => {
    it('should initialize auth from localStorage', () => {
      const mockUser = { id: '1', phone: '13800138000', username: '测试用户' };
      
      localStorageMock.getItem.mockImplementation((key) => {
        switch (key) {
          case 'taobei-token':
            return 'stored-token';
          case 'taobei-refresh-token':
            return 'stored-refresh-token';
          case 'taobei-user':
            return JSON.stringify(mockUser);
          default:
            return null;
        }
      });

      const { initializeAuth } = useAuthStore.getState();
      initializeAuth();
      
      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe('stored-token');
      expect(state.refreshToken).toBe('stored-refresh-token');
      expect(state.isAuthenticated).toBe(true);
      expect(state.session).toBeTruthy();
      expect(state.expiresAt).toBeTruthy();
    });

    it('should handle initialization failure', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        switch (key) {
          case 'taobei-token':
            return 'stored-token';
          case 'taobei-refresh-token':
            return 'stored-refresh-token';
          case 'taobei-user':
            return 'invalid-json';
          default:
            return null;
        }
      });

      const { initializeAuth } = useAuthStore.getState();
      initializeAuth();
      
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(consoleMock.error).toHaveBeenCalledWith(
        '初始化认证状态失败:',
        expect.any(Error)
      );
    });
  });

  describe('selectors', () => {
    it('should select user correctly', () => {
      const user = { id: '1', phone: '13800138000' } as any;
      useAuthStore.setState({ user });
      
      const state = useAuthStore.getState();
      expect(selectUser(state)).toBe(user);
    });

    it('should select isAuthenticated correctly', () => {
      useAuthStore.setState({ isAuthenticated: true });
      
      const state = useAuthStore.getState();
      expect(selectIsAuthenticated(state)).toBe(true);
    });

    it('should select isLoading correctly', () => {
      useAuthStore.setState({ isLoading: true });
      
      const state = useAuthStore.getState();
      expect(selectIsLoading(state)).toBe(true);
    });

    it('should select error correctly', () => {
      useAuthStore.setState({ error: '测试错误' });
      
      const state = useAuthStore.getState();
      expect(selectError(state)).toBe('测试错误');
    });

    it('should select session correctly', () => {
      const session = { user: {} as any, token: 'token', refreshToken: 'refresh', expiresAt: Date.now(), isAuthenticated: true };
      useAuthStore.setState({ session });
      
      const state = useAuthStore.getState();
      expect(selectSession(state)).toBe(session);
    });
  });
});