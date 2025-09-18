import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../../../src/App';

// Mock所有子组件
vi.mock('../../../src/components/TaobaoHeader', () => ({
  default: () => <div data-testid="taobao-header">TaobaoHeader</div>
}));

vi.mock('../../../src/components/CategoryNav', () => ({
  default: () => <div data-testid="category-nav">CategoryNav</div>
}));

vi.mock('../../../src/components/BannerCarousel', () => ({
  default: () => <div data-testid="banner-carousel">BannerCarousel</div>
}));

vi.mock('../../../src/components/UserPanel', () => ({
  default: ({ isLoggedIn, userName, onLogin, onLogout }: any) => (
    <div data-testid="user-panel">
      <div data-testid="login-status">{isLoggedIn ? 'logged-in' : 'logged-out'}</div>
      <div data-testid="user-name">{userName}</div>
      <button data-testid="login-btn" onClick={onLogin}>Login</button>
      <button data-testid="logout-btn" onClick={onLogout}>Logout</button>
    </div>
  )
}));

vi.mock('../../../src/components/ProductRecommendation', () => ({
  default: ({ products }: any) => (
    <div data-testid="product-recommendation">
      {products.map((product: any) => (
        <div key={product.id} data-testid={`product-${product.id}`}>
          {product.title}
        </div>
      ))}
    </div>
  )
}));

vi.mock('../../../src/components/TaobaoFooter', () => ({
  default: () => <div data-testid="taobao-footer">TaobaoFooter</div>
}));

// Mock console.log
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

describe('App', () => {
  beforeEach(() => {
    mockConsoleLog.mockClear();
  });

  it('应该渲染所有主要组件', () => {
    render(<App />);
    
    expect(screen.getByTestId('taobao-header')).toBeInTheDocument();
    expect(screen.getByTestId('category-nav')).toBeInTheDocument();
    expect(screen.getByTestId('banner-carousel')).toBeInTheDocument();
    expect(screen.getByTestId('user-panel')).toBeInTheDocument();
    expect(screen.getByTestId('product-recommendation')).toBeInTheDocument();
    expect(screen.getByTestId('taobao-footer')).toBeInTheDocument();
  });

  it('应该有正确的CSS类名结构', () => {
    const { container } = render(<App />);
    
    expect(container.querySelector('.tb-app')).toBeInTheDocument();
    expect(container.querySelector('.tb-main-content')).toBeInTheDocument();
    expect(container.querySelector('.tb-container')).toBeInTheDocument();
    expect(container.querySelector('.tb-content-wrapper')).toBeInTheDocument();
    expect(container.querySelector('.tb-left-content')).toBeInTheDocument();
    expect(container.querySelector('.tb-right-content')).toBeInTheDocument();
  });

  it('应该在组件挂载时输出日志', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(mockConsoleLog).toHaveBeenCalledWith('淘宝PC端首页加载完成');
    });
  });

  it('应该初始化为未登录状态', () => {
    render(<App />);
    
    expect(screen.getByTestId('login-status')).toHaveTextContent('logged-out');
    expect(screen.getByTestId('user-name')).toHaveTextContent('');
  });

  it('应该能够处理用户登录', () => {
    render(<App />);
    
    const loginBtn = screen.getByTestId('login-btn');
    fireEvent.click(loginBtn);
    
    expect(screen.getByTestId('login-status')).toHaveTextContent('logged-in');
    expect(screen.getByTestId('user-name')).toHaveTextContent('淘宝用户');
  });

  it('应该能够处理用户登出', () => {
    render(<App />);
    
    // 先登录
    const loginBtn = screen.getByTestId('login-btn');
    fireEvent.click(loginBtn);
    
    expect(screen.getByTestId('login-status')).toHaveTextContent('logged-in');
    
    // 再登出
    const logoutBtn = screen.getByTestId('logout-btn');
    fireEvent.click(logoutBtn);
    
    expect(screen.getByTestId('login-status')).toHaveTextContent('logged-out');
    expect(screen.getByTestId('user-name')).toHaveTextContent('');
  });

  it('应该传递正确的props给UserPanel', () => {
    render(<App />);
    
    // 初始状态
    expect(screen.getByTestId('login-status')).toHaveTextContent('logged-out');
    expect(screen.getByTestId('user-name')).toHaveTextContent('');
    
    // 登录后
    fireEvent.click(screen.getByTestId('login-btn'));
    expect(screen.getByTestId('login-status')).toHaveTextContent('logged-in');
    expect(screen.getByTestId('user-name')).toHaveTextContent('淘宝用户');
  });

  it('应该传递模拟商品数据给ProductRecommendation', () => {
    render(<App />);
    
    // 检查是否渲染了模拟商品
    expect(screen.getByTestId('product-1')).toHaveTextContent('iPhone 15 Pro Max 256GB 深空黑色');
    expect(screen.getByTestId('product-2')).toHaveTextContent('华为Mate60 Pro 12GB+512GB 雅川青');
    expect(screen.getByTestId('product-3')).toHaveTextContent('小米14 Ultra 16GB+1TB 钛金属');
  });

  it('应该正确处理状态变化', () => {
    render(<App />);
    
    // 多次登录登出测试
    const loginBtn = screen.getByTestId('login-btn');
    const logoutBtn = screen.getByTestId('logout-btn');
    
    // 第一次登录
    fireEvent.click(loginBtn);
    expect(screen.getByTestId('login-status')).toHaveTextContent('logged-in');
    
    // 登出
    fireEvent.click(logoutBtn);
    expect(screen.getByTestId('login-status')).toHaveTextContent('logged-out');
    
    // 第二次登录
    fireEvent.click(loginBtn);
    expect(screen.getByTestId('login-status')).toHaveTextContent('logged-in');
    expect(screen.getByTestId('user-name')).toHaveTextContent('淘宝用户');
  });

  it('应该有正确的布局结构', () => {
    const { container } = render(<App />);
    
    const leftContent = container.querySelector('.tb-left-content');
    const rightContent = container.querySelector('.tb-right-content');
    
    expect(leftContent).toBeInTheDocument();
    expect(rightContent).toBeInTheDocument();
    
    // 检查左侧内容包含轮播图
    expect(leftContent?.querySelector('[data-testid="banner-carousel"]')).toBeInTheDocument();
    
    // 检查右侧内容包含用户面板和商品推荐
    expect(rightContent?.querySelector('[data-testid="user-panel"]')).toBeInTheDocument();
    expect(rightContent?.querySelector('[data-testid="product-recommendation"]')).toBeInTheDocument();
  });
});