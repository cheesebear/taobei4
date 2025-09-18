import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // 测试环境配置
    environment: 'jsdom',
    
    // 全局设置文件
    setupFiles: ['./tests/setup.ts', './src/test/setup.ts'],
    
    // 测试文件匹配模式
    include: [
      'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    
    // 排除文件
    exclude: [
      'node_modules',
      'dist',
      '.idea',
      '.git',
      '.cache'
    ],
    
    // 全局变量
    globals: true,
    
    // CSS支持
    css: true,
    
    // 测试超时时间（毫秒）
    testTimeout: 30000,
    
    // 钩子超时时间（毫秒）
    hookTimeout: 30000,
    
    // 并发运行测试
    pool: 'threads',
    
    // 最大并发数
    poolOptions: {
      threads: {
        maxThreads: 4,
        minThreads: 1
      }
    },
    
    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/vite.config.ts',
        '**/vitest.config.ts'
      ]
    },
    
    // 报告器配置
    reporter: ['default'],
    
    // 监听模式配置
    watch: false,
    
    // 静默模式
    silent: false,
    
    // 环境变量
    env: {
      NODE_ENV: 'test',
      VITE_API_BASE_URL: 'http://localhost:3001',
      VITE_APP_BASE_URL: 'http://localhost:5173'
    }
  },
  
  // 路径解析
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tests': path.resolve(__dirname, './tests')
    }
  }
});