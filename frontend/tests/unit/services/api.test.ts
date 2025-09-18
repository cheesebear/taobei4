import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { ApiClient, ApiError, ApiErrorType, apiClient, api } from '../../../src/services/api';

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      defaults: { baseURL: '', timeout: 0 },
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      }
    })),
    isAxiosError: vi.fn(),
    post: vi.fn()
  }
}));

const mockAxios = axios as any;
const mockInstance = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
  defaults: { baseURL: '', timeout: 0 },
  interceptors: {
    request: { use: vi.fn() },
    response: { use: vi.fn() }
  }
};

describe('ApiError', () => {
  it('should create ApiError with all properties', () => {
    const originalError = new Error('Original error');
    const apiError = new ApiError(
      'Test error',
      ApiErrorType.VALIDATION_ERROR,
      400,
      'TEST_CODE',
      { field: 'test' },
      originalError
    );

    expect(apiError.message).toBe('Test error');
    expect(apiError.type).toBe(ApiErrorType.VALIDATION_ERROR);
    expect(apiError.status).toBe(400);
    expect(apiError.code).toBe('TEST_CODE');
    expect(apiError.data).toEqual({ field: 'test' });
    expect(apiError.originalError).toBe(originalError);
  });

  it('should create ApiError with minimal properties', () => {
    const apiError = new ApiError('Simple error', ApiErrorType.UNKNOWN_ERROR);

    expect(apiError.message).toBe('Simple error');
    expect(apiError.type).toBe(ApiErrorType.UNKNOWN_ERROR);
    expect(apiError.status).toBeUndefined();
    expect(apiError.code).toBeUndefined();
    expect(apiError.data).toBeUndefined();
    expect(apiError.originalError).toBeUndefined();
  });
});

describe('ApiClient', () => {
  let apiClient: ApiClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.create.mockReturnValue(mockInstance);
    apiClient = new ApiClient({
      baseURL: 'https://api.test.com',
      timeout: 5000
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create ApiClient with default config', () => {
      const client = new ApiClient();
      expect(mockAxios.create).toHaveBeenCalled();
    });

    it('should create ApiClient with custom config', () => {
      const config = {
        baseURL: 'https://custom.api.com',
        timeout: 10000,
        enableLogging: false
      };
      const client = new ApiClient(config);
      expect(mockAxios.create).toHaveBeenCalledWith({
        baseURL: config.baseURL,
        timeout: config.timeout,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
    });
  });

  describe('authentication methods', () => {
    it('should set auth token', () => {
      const token = 'test-token';
      apiClient.setAuthToken(token);
      expect((apiClient as any).authToken).toBe(token);
    });

    it('should set refresh token', () => {
      const token = 'refresh-token';
      apiClient.setRefreshToken(token);
      expect((apiClient as any).refreshToken).toBe(token);
    });

    it('should clear auth tokens', () => {
      apiClient.setAuthToken('auth-token');
      apiClient.setRefreshToken('refresh-token');
      apiClient.clearAuth();
      expect((apiClient as any).authToken).toBeNull();
      expect((apiClient as any).refreshToken).toBeNull();
    });
  });

  describe('HTTP methods', () => {
    const mockResponse = {
      data: {
        success: true,
        data: { id: 1, name: 'Test' },
        message: 'Success'
      }
    };

    it('should make GET request', async () => {
      mockInstance.get.mockResolvedValue(mockResponse);
      
      const result = await apiClient.get('/test');
      
      expect(mockInstance.get).toHaveBeenCalledWith('/test', undefined);
      expect(result).toEqual(mockResponse.data);
    });

    it('should make POST request', async () => {
      const postData = { name: 'Test' };
      mockInstance.post.mockResolvedValue(mockResponse);
      
      const result = await apiClient.post('/test', postData);
      
      expect(mockInstance.post).toHaveBeenCalledWith('/test', postData, undefined);
      expect(result).toEqual(mockResponse.data);
    });

    it('should make PUT request', async () => {
      const putData = { id: 1, name: 'Updated' };
      mockInstance.put.mockResolvedValue(mockResponse);
      
      const result = await apiClient.put('/test/1', putData);
      
      expect(mockInstance.put).toHaveBeenCalledWith('/test/1', putData, undefined);
      expect(result).toEqual(mockResponse.data);
    });

    it('should make PATCH request', async () => {
      const patchData = { name: 'Patched' };
      mockInstance.patch.mockResolvedValue(mockResponse);
      
      const result = await apiClient.patch('/test/1', patchData);
      
      expect(mockInstance.patch).toHaveBeenCalledWith('/test/1', patchData, undefined);
      expect(result).toEqual(mockResponse.data);
    });

    it('should make DELETE request', async () => {
      mockInstance.delete.mockResolvedValue(mockResponse);
      
      const result = await apiClient.delete('/test/1');
      
      expect(mockInstance.delete).toHaveBeenCalledWith('/test/1', undefined);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getPaginated', () => {
    it('should make paginated GET request', async () => {
      const paginatedResponse = {
        data: {
          success: true,
          data: [{ id: 1 }, { id: 2 }],
          pagination: {
            page: 1,
            limit: 10,
            total: 2,
            totalPages: 1
          }
        }
      };
      mockInstance.get.mockResolvedValue(paginatedResponse);
      
      const result = await apiClient.getPaginated('/test');
      
      expect(mockInstance.get).toHaveBeenCalledWith('/test', undefined);
      expect(result).toEqual(paginatedResponse.data);
    });
  });

  describe('upload', () => {
    it('should upload file', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const uploadResponse = {
        data: {
          success: true,
          data: { url: 'https://example.com/file.txt' }
        }
      };
      mockInstance.post.mockResolvedValue(uploadResponse);
      
      const result = await apiClient.upload('/upload', file);
      
      expect(mockInstance.post).toHaveBeenCalledWith(
        '/upload',
        expect.any(FormData),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'multipart/form-data'
          })
        })
      );
      expect(result).toEqual(uploadResponse.data);
    });

    it('should upload file with progress callback', async () => {
      const file = new File(['test'], 'test.txt');
      const onProgress = vi.fn();
      const uploadResponse = { data: { success: true, data: {} } };
      mockInstance.post.mockResolvedValue(uploadResponse);
      
      await apiClient.upload('/upload', file, onProgress);
      
      expect(mockInstance.post).toHaveBeenCalledWith(
        '/upload',
        expect.any(FormData),
        expect.objectContaining({
          onUploadProgress: onProgress
        })
      );
    });
  });

  describe('download', () => {
    it('should download file', async () => {
      const mockBlob = new Blob(['file content']);
      const downloadResponse = { data: mockBlob };
      mockInstance.get.mockResolvedValue(downloadResponse);
      
      // Mock URL methods if they don't exist
      if (!global.URL) {
        global.URL = {} as any;
      }
      if (!global.URL.createObjectURL) {
        global.URL.createObjectURL = vi.fn();
      }
      if (!global.URL.revokeObjectURL) {
        global.URL.revokeObjectURL = vi.fn();
      }
      
      // Mock DOM methods
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn()
      };
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);
      const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:url');
      const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
      
      await apiClient.download('/download', 'test.txt');
      
      expect(mockInstance.get).toHaveBeenCalledWith('/download', expect.objectContaining({
        responseType: 'blob'
      }));
      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(mockLink.download).toBe('test.txt');
      expect(mockLink.click).toHaveBeenCalled();
      expect(appendChildSpy).toHaveBeenCalledWith(mockLink);
      expect(removeChildSpy).toHaveBeenCalledWith(mockLink);
      expect(createObjectURLSpy).toHaveBeenCalledWith(mockBlob);
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:url');
      
      // Restore mocks
      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
      createObjectURLSpy.mockRestore();
      revokeObjectURLSpy.mockRestore();
    });
  });

  describe('retry', () => {
    it('should retry failed requests', async () => {
      const requestFn = vi.fn()
        .mockRejectedValueOnce(new Error('First attempt'))
        .mockRejectedValueOnce(new Error('Second attempt'))
        .mockResolvedValueOnce('Success');
      
      const result = await apiClient.retry(requestFn, 3, 10);
      
      expect(requestFn).toHaveBeenCalledTimes(3);
      expect(result).toBe('Success');
    });

    it('should throw error when all attempts fail', async () => {
      const requestFn = vi.fn().mockRejectedValue(new Error('Always fails'));
      
      await expect(apiClient.retry(requestFn, 2, 10)).rejects.toThrow('Always fails');
      expect(requestFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('batch', () => {
    it('should execute batch requests with concurrency limit', async () => {
      const requests = [
        () => Promise.resolve('Result 1'),
        () => Promise.resolve('Result 2'),
        () => Promise.resolve('Result 3')
      ];
      
      const results = await apiClient.batch(requests, 2);
      
      expect(results).toHaveLength(3);
      expect(results).toContain('Result 1');
      expect(results).toContain('Result 2');
      expect(results).toContain('Result 3');
    });
  });

  describe('config management', () => {
    it('should get current config', () => {
      const config = apiClient.getConfig();
      expect(config).toHaveProperty('baseURL');
      expect(config).toHaveProperty('timeout');
    });

    it('should update config', () => {
      const newConfig = {
        baseURL: 'https://new-api.com',
        timeout: 15000
      };
      
      apiClient.updateConfig(newConfig);
      
      expect(mockInstance.defaults.baseURL).toBe(newConfig.baseURL);
      expect(mockInstance.defaults.timeout).toBe(newConfig.timeout);
    });
  });

  describe('error handling', () => {
    it('should handle network errors', () => {
      const networkError = {
        code: 'ECONNABORTED',
        response: undefined
      } as AxiosError;
      
      mockAxios.isAxiosError.mockReturnValue(true);
      
      const apiError = (apiClient as any).handleError(networkError);
      
      expect(apiError).toBeInstanceOf(ApiError);
      expect(apiError.type).toBe(ApiErrorType.TIMEOUT_ERROR);
      expect(apiError.message).toContain('请求超时');
    });

    it('should handle 401 unauthorized errors', () => {
      const unauthorizedError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      } as AxiosError;
      
      mockAxios.isAxiosError.mockReturnValue(true);
      
      const apiError = (apiClient as any).handleError(unauthorizedError);
      
      expect(apiError).toBeInstanceOf(ApiError);
      expect(apiError.type).toBe(ApiErrorType.AUTH_ERROR);
      expect(apiError.status).toBe(401);
    });

    it('should handle 500 server errors', () => {
      const serverError = {
        response: {
          status: 500,
          data: { message: 'Internal Server Error' }
        }
      } as AxiosError;
      
      mockAxios.isAxiosError.mockReturnValue(true);
      
      const apiError = (apiClient as any).handleError(serverError);
      
      expect(apiError).toBeInstanceOf(ApiError);
      expect(apiError.type).toBe(ApiErrorType.SERVER_ERROR);
      expect(apiError.status).toBe(500);
    });

    it('should handle unknown errors', () => {
      const unknownError = new Error('Unknown error');
      
      mockAxios.isAxiosError.mockReturnValue(false);
      
      const apiError = (apiClient as any).handleError(unknownError);
      
      expect(apiError).toBeInstanceOf(ApiError);
      expect(apiError.type).toBe(ApiErrorType.UNKNOWN_ERROR);
      expect(apiError.message).toBe('Unknown error');
    });
  });
});

describe('api convenience methods', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call apiClient.get', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({ success: true, data: {} });
    
    await api.get('/test');
    
    expect(getSpy).toHaveBeenCalledWith('/test', undefined);
  });

  it('should call apiClient.post', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({ success: true, data: {} });
    
    await api.post('/test', { data: 'test' });
    
    expect(postSpy).toHaveBeenCalledWith('/test', { data: 'test' }, undefined);
  });

  it('should call apiClient.upload', async () => {
    const file = new File(['test'], 'test.txt');
    const uploadSpy = vi.spyOn(apiClient, 'upload').mockResolvedValue({ success: true, data: {} });
    
    await api.upload('/upload', file);
    
    expect(uploadSpy).toHaveBeenCalledWith('/upload', file, undefined, undefined);
  });
});