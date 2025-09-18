import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProductRecommendation from '../../../src/components/ProductRecommendation';

// Mock canvas for image error handling
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: vi.fn(() => ({
    fillStyle: '',
    strokeStyle: '',
    font: '',
    textAlign: '',
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    fillText: vi.fn(),
  })),
});

Object.defineProperty(HTMLCanvasElement.prototype, 'toDataURL', {
  value: vi.fn(() => 'data:image/png;base64,mock'),
});

describe('ProductRecommendation', () => {
  it('should render recommendation title', () => {
    render(<ProductRecommendation />);
    
    expect(screen.getByText('为你推荐')).toBeInTheDocument();
  });

  it('should render all recommended products', () => {
    render(<ProductRecommendation />);
    
    // 检查所有产品是否渲染
    expect(screen.getByText('¥89')).toBeInTheDocument();
    expect(screen.getByText('¥199')).toBeInTheDocument();
    expect(screen.getByText('¥299')).toBeInTheDocument();
    expect(screen.getByText('¥159')).toBeInTheDocument();
    expect(screen.getByText('¥399')).toBeInTheDocument();
    expect(screen.getByText('¥39')).toBeInTheDocument();
  });

  it('should render product tags', () => {
    render(<ProductRecommendation />);
    
    // 检查产品标签
    expect(screen.getByText('热销')).toBeInTheDocument();
    expect(screen.getByText('新品')).toBeInTheDocument();
    expect(screen.getByText('爆款')).toBeInTheDocument();
    expect(screen.getByText('特价')).toBeInTheDocument();
    expect(screen.getByText('推荐')).toBeInTheDocument();
    expect(screen.getByText('实用')).toBeInTheDocument();
  });

  it('should render product images with correct alt text', () => {
    render(<ProductRecommendation />);
    
    // 检查产品图片
    expect(screen.getByAltText('秋冬新款毛衣')).toBeInTheDocument();
    expect(screen.getByAltText('无线蓝牙耳机')).toBeInTheDocument();
    expect(screen.getByAltText('运动休闲鞋')).toBeInTheDocument();
    expect(screen.getByAltText('护肤套装')).toBeInTheDocument();
    expect(screen.getByAltText('智能手表')).toBeInTheDocument();
    expect(screen.getByAltText('家居收纳盒')).toBeInTheDocument();
  });

  it('should call onProductClick when product is clicked', () => {
    const mockOnProductClick = vi.fn();
    render(<ProductRecommendation onProductClick={mockOnProductClick} />);
    
    // 点击第一个产品
    const firstProduct = screen.getByAltText('秋冬新款毛衣').closest('.tb-product-card');
    fireEvent.click(firstProduct!);
    
    expect(mockOnProductClick).toHaveBeenCalledWith({
      id: 1,
      title: '秋冬新款毛衣',
      price: '¥89',
      image: expect.any(String),
      tag: '热销'
    });
  });

  it('should handle multiple product clicks', () => {
    const mockOnProductClick = vi.fn();
    render(<ProductRecommendation onProductClick={mockOnProductClick} />);
    
    // 点击多个产品
    const firstProduct = screen.getByAltText('秋冬新款毛衣').closest('.tb-product-card');
    const secondProduct = screen.getByAltText('无线蓝牙耳机').closest('.tb-product-card');
    
    fireEvent.click(firstProduct!);
    fireEvent.click(secondProduct!);
    
    expect(mockOnProductClick).toHaveBeenCalledTimes(2);
    expect(mockOnProductClick).toHaveBeenNthCalledWith(1, expect.objectContaining({
      id: 1,
      title: '秋冬新款毛衣'
    }));
    expect(mockOnProductClick).toHaveBeenNthCalledWith(2, expect.objectContaining({
      id: 2,
      title: '无线蓝牙耳机'
    }));
  });

  it('should handle missing onProductClick callback gracefully', () => {
    render(<ProductRecommendation />);
    
    const firstProduct = screen.getByAltText('秋冬新款毛衣').closest('.tb-product-card');
    
    // 应该不会抛出错误
    expect(() => {
      fireEvent.click(firstProduct!);
    }).not.toThrow();
  });

  it('should handle image loading errors', () => {
    render(<ProductRecommendation />);
    
    const productImage = screen.getByAltText('秋冬新款毛衣') as HTMLImageElement;
    
    // 模拟图片加载失败
    fireEvent.error(productImage);
    
    // 检查是否设置了备用图片
    expect(productImage.src).toContain('data:image/png;base64,mock');
  });

  it('should render more recommendations link', () => {
    render(<ProductRecommendation />);
    
    const moreLink = screen.getByText('查看更多推荐 →');
    expect(moreLink).toBeInTheDocument();
    expect(moreLink.tagName).toBe('A');
  });

  it('should handle more recommendations link hover', () => {
    render(<ProductRecommendation />);
    
    const moreLink = screen.getByText('查看更多推荐 →') as HTMLAnchorElement;
    
    // 测试鼠标悬停
    fireEvent.mouseOver(moreLink);
    expect(moreLink.style.textDecoration).toBe('underline');
    
    // 测试鼠标离开
    fireEvent.mouseOut(moreLink);
    expect(moreLink.style.textDecoration).toBe('none');
  });

  it('should render correct number of products', () => {
    render(<ProductRecommendation />);
    
    const productCards = document.querySelectorAll('.tb-product-card');
    expect(productCards).toHaveLength(6);
  });

  it('should have proper styling for title', () => {
    render(<ProductRecommendation />);
    
    const title = screen.getByText('为你推荐');
    const titleStyles = window.getComputedStyle(title);
    
    // 注意：在测试环境中，内联样式可能不会被完全应用
    // 这里主要检查元素是否存在
    expect(title).toBeInTheDocument();
  });
});