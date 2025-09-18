import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TaobaoHeader from '../../../src/components/TaobaoHeader';

describe('TaobaoHeader', () => {
  it('should render correctly', () => {
    render(<TaobaoHeader />);
    
    // 检查Logo是否存在
    const logo = screen.getByAltText('淘宝网');
    expect(logo).toBeInTheDocument();
    
    // 检查搜索框是否存在
    const searchInput = screen.getByPlaceholderText('搜索 淘宝网');
    expect(searchInput).toBeInTheDocument();
    
    // 检查搜索按钮是否存在
    const searchButton = screen.getByRole('button', { name: '搜索' });
    expect(searchButton).toBeInTheDocument();
  });

  it('should handle search input changes', () => {
    render(<TaobaoHeader />);
    
    const searchInput = screen.getByPlaceholderText('搜索 淘宝网') as HTMLInputElement;
    
    fireEvent.change(searchInput, { target: { value: '手机' } });
    
    expect(searchInput.value).toBe('手机');
  });

  it('should call onSearch when search button is clicked', () => {
    const mockOnSearch = vi.fn();
    render(<TaobaoHeader onSearch={mockOnSearch} />);
    
    const searchInput = screen.getByPlaceholderText('搜索 淘宝网');
    const searchButton = screen.getByRole('button', { name: '搜索' });
    
    fireEvent.change(searchInput, { target: { value: '手机' } });
    fireEvent.click(searchButton);
    
    expect(mockOnSearch).toHaveBeenCalledWith('手机');
  });

  it('should call onSearch when Enter key is pressed', () => {
    const mockOnSearch = vi.fn();
    render(<TaobaoHeader onSearch={mockOnSearch} />);
    
    const searchInput = screen.getByPlaceholderText('搜索 淘宝网');
    
    fireEvent.change(searchInput, { target: { value: '电脑' } });
    fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });
    
    expect(mockOnSearch).toHaveBeenCalledWith('电脑');
  });

  it('should not call onSearch with empty query', () => {
    const mockOnSearch = vi.fn();
    render(<TaobaoHeader onSearch={mockOnSearch} />);
    
    const searchButton = screen.getByRole('button', { name: '搜索' });
    
    fireEvent.click(searchButton);
    
    expect(mockOnSearch).not.toHaveBeenCalled();
  });

  it('should trim whitespace from search query', () => {
    const mockOnSearch = vi.fn();
    render(<TaobaoHeader onSearch={mockOnSearch} />);
    
    const searchInput = screen.getByPlaceholderText('搜索 淘宝网');
    const searchButton = screen.getByRole('button', { name: '搜索' });
    
    fireEvent.change(searchInput, { target: { value: '  手机  ' } });
    fireEvent.click(searchButton);
    
    expect(mockOnSearch).toHaveBeenCalledWith('手机');
  });

  it('should render navigation links', () => {
    render(<TaobaoHeader />);
    
    // 检查主要导航链接
    expect(screen.getByText('首页')).toBeInTheDocument();
    expect(screen.getByText('天猫')).toBeInTheDocument();
    expect(screen.getByText('聚划算')).toBeInTheDocument();
    expect(screen.getByText('天猫超市')).toBeInTheDocument();
  });

  it('should render top navigation links', () => {
    render(<TaobaoHeader />);
    
    // 检查顶部导航链接
    expect(screen.getByText('亲，请登录')).toBeInTheDocument();
    expect(screen.getByText('免费注册')).toBeInTheDocument();
    expect(screen.getByText('我的淘宝')).toBeInTheDocument();
    expect(screen.getByText('购物车')).toBeInTheDocument();
  });

  it('should render search suggestions', () => {
    render(<TaobaoHeader />);
    
    // 检查搜索建议
    expect(screen.getByText('连衣裙')).toBeInTheDocument();
    expect(screen.getByText('手机')).toBeInTheDocument();
    expect(screen.getByText('电脑')).toBeInTheDocument();
    expect(screen.getByText('家居')).toBeInTheDocument();
  });

  it('should handle logo image error', () => {
    render(<TaobaoHeader />);
    
    const logo = screen.getByAltText('淘宝网') as HTMLImageElement;
    
    // 模拟图片加载失败
    fireEvent.error(logo);
    
    // 检查是否设置了备用图片
    expect(logo.src).toContain('data:image/svg+xml');
  });
});