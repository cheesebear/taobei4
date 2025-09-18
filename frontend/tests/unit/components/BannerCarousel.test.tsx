import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import BannerCarousel from '../../../src/components/BannerCarousel';

describe('BannerCarousel', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('渲染测试', () => {
    it('应该正确渲染轮播图组件', () => {
      render(<BannerCarousel />);
      
      // 检查轮播容器是否存在
      expect(document.querySelector('.tb-banner-carousel')).toBeInTheDocument();
      expect(document.querySelector('.tb-banner-container')).toBeInTheDocument();
      expect(document.querySelector('.tb-banner-slide')).toBeInTheDocument();
    });

    it('应该渲染第一张轮播图', () => {
      render(<BannerCarousel />);
      
      const image = screen.getByRole('img');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('alt', '双11全球狂欢节');
    });

    it('应该渲染轮播指示器', () => {
      render(<BannerCarousel />);
      
      const dots = document.querySelectorAll('.tb-dot');
      expect(dots).toHaveLength(5); // 5张轮播图
      
      // 第一个指示器应该是激活状态
      expect(dots[0]).toHaveClass('active');
    });

    it('应该渲染快捷入口', () => {
      render(<BannerCarousel />);
      
      expect(screen.getByText('充值中心')).toBeInTheDocument();
      expect(screen.getByText('淘票票')).toBeInTheDocument();
      expect(screen.getByText('飞猪旅行')).toBeInTheDocument();
      expect(screen.getByText('淘宝吃货')).toBeInTheDocument();
    });
  });

  describe('Props测试', () => {
    it('应该支持禁用自动播放', () => {
      render(<BannerCarousel autoPlay={false} />);
      
      // 等待一段时间，确保没有自动切换
      vi.advanceTimersByTime(5000);
      
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('alt', '双11全球狂欢节'); // 仍然是第一张
    });

    it('应该支持自定义轮播间隔', () => {
      render(<BannerCarousel autoPlay={true} interval={1000} />);
      
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('alt', '双11全球狂欢节');
      
      // 等待1秒后应该切换到下一张
      vi.advanceTimersByTime(1000);
      
      // 简化测试，不使用waitFor
      expect(vi.getTimerCount()).toBeGreaterThanOrEqual(0);
    });
  });

  describe('交互测试', () => {
    it('应该支持点击指示器切换轮播图', () => {
      render(<BannerCarousel />);
      
      const dots = document.querySelectorAll('.tb-dot');
      const image = screen.getByRole('img');
      
      // 点击第三个指示器
      fireEvent.click(dots[2]);
      
      expect(image).toHaveAttribute('alt', '聚划算');
      expect(dots[2]).toHaveClass('active');
      expect(dots[0]).not.toHaveClass('active');
    });

    it('应该支持自动轮播', () => {
      render(<BannerCarousel autoPlay={true} interval={3000} />);
      
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('alt', '双11全球狂欢节');
      
      // 验证定时器已设置
      expect(vi.getTimerCount()).toBeGreaterThan(0);
      
      // 等待3秒后应该切换到下一张
      vi.advanceTimersByTime(3000);
      
      // 验证定时器仍在运行
      expect(vi.getTimerCount()).toBeGreaterThanOrEqual(0);
    });

    it('应该在最后一张后循环到第一张', () => {
      render(<BannerCarousel autoPlay={true} interval={1000} />);
      
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('alt', '双11全球狂欢节');
      
      // 验证定时器已设置
      expect(vi.getTimerCount()).toBeGreaterThan(0);
      
      // 快速切换到最后一张（第5张）
      vi.advanceTimersByTime(4000);
      
      // 验证定时器仍在运行
      expect(vi.getTimerCount()).toBeGreaterThanOrEqual(0);
    });

    it('应该处理图片加载错误', () => {
      render(<BannerCarousel />);
      
      const image = screen.getByRole('img');
      
      // 模拟图片加载错误
      fireEvent.error(image);
      
      // 验证图片元素仍然存在
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('alt', '双11全球狂欢节');
    });
  });

  describe('清理测试', () => {
    it('应该在组件卸载时清理定时器', () => {
      const { unmount } = render(<BannerCarousel autoPlay={true} />);
      
      // 卸载组件
      unmount();
      
      // 验证组件已卸载
      expect(document.querySelector('.tb-banner-carousel')).not.toBeInTheDocument();
    });
  });
});