import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CategoryNav from '../../../src/components/CategoryNav';

describe('CategoryNav', () => {
  describe('渲染测试', () => {
    it('应该正确渲染分类导航组件', () => {
      render(<CategoryNav />);
      
      // 检查主要容器和标题
      expect(document.querySelector('.tb-category-nav')).toBeInTheDocument();
      expect(screen.getByText('商品分类')).toBeInTheDocument();
      expect(document.querySelector('.tb-category-list')).toBeInTheDocument();
    });

    it('应该渲染所有主分类', () => {
      render(<CategoryNav />);
      
      // 检查主要分类是否都存在
      expect(screen.getByText('女装/内衣')).toBeInTheDocument();
      expect(screen.getByText('男装/运动户外')).toBeInTheDocument();
      expect(screen.getByText('手机/数码/电脑')).toBeInTheDocument();
      expect(screen.getByText('家电/家具/家装')).toBeInTheDocument();
      expect(screen.getByText('汽车/配件/用品')).toBeInTheDocument();
      expect(screen.getByText('母婴/玩具/童装')).toBeInTheDocument();
      expect(screen.getByText('美妆/个护/宠物')).toBeInTheDocument();
      expect(screen.getByText('女鞋/箱包/配饰')).toBeInTheDocument();
      expect(screen.getByText('运动/户外/乐器')).toBeInTheDocument();
      expect(screen.getByText('游戏/动漫/影视')).toBeInTheDocument();
      expect(screen.getByText('美食/生鲜/零食')).toBeInTheDocument();
      expect(screen.getByText('鲜花/园艺/工艺')).toBeInTheDocument();
    });

    it('应该渲染子分类', () => {
      render(<CategoryNav />);
      
      // 检查女装分类的子分类
      expect(screen.getByText('连衣裙')).toBeInTheDocument();
      expect(screen.getByText('半身裙')).toBeInTheDocument();
      expect(screen.getByText('毛衣')).toBeInTheDocument();
      
      // 检查手机分类的子分类
      expect(screen.getByText('手机')).toBeInTheDocument();
      expect(screen.getByText('平板电脑')).toBeInTheDocument();
      expect(screen.getByText('笔记本')).toBeInTheDocument();
    });

    it('应该正确渲染分类项结构', () => {
      render(<CategoryNav />);
      
      const categoryItems = document.querySelectorAll('.tb-category-item');
      expect(categoryItems).toHaveLength(12); // 12个主分类
      
      // 检查第一个分类项的结构
      const firstCategory = categoryItems[0];
      expect(firstCategory.querySelector('.tb-category-name')).toBeInTheDocument();
      expect(firstCategory.querySelector('.tb-category-sub')).toBeInTheDocument();
      
      // 检查子分类链接
      const subLinks = firstCategory.querySelectorAll('.tb-sub-link');
      expect(subLinks.length).toBeGreaterThan(0);
    });
  });

  describe('Props测试', () => {
    it('应该支持onCategorySelect回调', () => {
      const mockCallback = vi.fn();
      render(<CategoryNav onCategorySelect={mockCallback} />);
      
      // 点击主分类
      const categoryName = screen.getByText('女装/内衣');
      fireEvent.click(categoryName);
      
      expect(mockCallback).toHaveBeenCalledWith('女装/内衣');
    });

    it('应该在没有回调时正常工作', () => {
      // 不传递onCategorySelect prop
      expect(() => {
        render(<CategoryNav />);
      }).not.toThrow();
      
      // 点击分类不应该报错
      const categoryName = screen.getByText('女装/内衣');
      expect(() => {
        fireEvent.click(categoryName);
      }).not.toThrow();
    });
  });

  describe('交互测试', () => {
    it('应该支持点击主分类', () => {
      const mockCallback = vi.fn();
      render(<CategoryNav onCategorySelect={mockCallback} />);
      
      // 点击不同的主分类
      fireEvent.click(screen.getByText('男装/运动户外'));
      expect(mockCallback).toHaveBeenCalledWith('男装/运动户外');
      
      fireEvent.click(screen.getByText('手机/数码/电脑'));
      expect(mockCallback).toHaveBeenCalledWith('手机/数码/电脑');
      
      expect(mockCallback).toHaveBeenCalledTimes(2);
    });

    it('应该支持点击子分类', () => {
      const mockCallback = vi.fn();
      render(<CategoryNav onCategorySelect={mockCallback} />);
      
      // 点击子分类链接
      const subCategoryLink = screen.getByText('连衣裙');
      fireEvent.click(subCategoryLink);
      
      expect(mockCallback).toHaveBeenCalledWith('连衣裙');
    });

    it('应该阻止子分类链接的默认行为', () => {
      const mockCallback = vi.fn();
      render(<CategoryNav onCategorySelect={mockCallback} />);
      
      const subCategoryLink = screen.getByText('连衣裙');
      const clickEvent = new MouseEvent('click', { bubbles: true });
      const preventDefaultSpy = vi.spyOn(clickEvent, 'preventDefault');
      
      subCategoryLink.dispatchEvent(clickEvent);
      
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('应该为每个子分类调用回调', () => {
      const mockCallback = vi.fn();
      render(<CategoryNav onCategorySelect={mockCallback} />);
      
      // 点击女装分类的多个子分类
      fireEvent.click(screen.getByText('连衣裙'));
      fireEvent.click(screen.getByText('半身裙'));
      fireEvent.click(screen.getByText('毛衣'));
      
      expect(mockCallback).toHaveBeenCalledWith('连衣裙');
      expect(mockCallback).toHaveBeenCalledWith('半身裙');
      expect(mockCallback).toHaveBeenCalledWith('毛衣');
      expect(mockCallback).toHaveBeenCalledTimes(3);
    });
  });

  describe('数据完整性测试', () => {
    it('应该包含正确数量的分类和子分类', () => {
      render(<CategoryNav />);
      
      // 检查主分类数量
      const categoryItems = document.querySelectorAll('.tb-category-item');
      expect(categoryItems).toHaveLength(12);
      
      // 检查每个分类都有子分类
      categoryItems.forEach((item) => {
        const subLinks = item.querySelectorAll('.tb-sub-link');
        expect(subLinks.length).toBeGreaterThan(0);
        expect(subLinks.length).toBeLessThanOrEqual(10); // 每个分类最多10个子分类
      });
    });

    it('应该为所有链接设置正确的href属性', () => {
      render(<CategoryNav />);
      
      const subLinks = document.querySelectorAll('.tb-sub-link');
      subLinks.forEach((link) => {
        expect(link).toHaveAttribute('href', '#');
      });
    });

    it('应该包含特定的分类内容', () => {
      render(<CategoryNav />);
      
      // 验证女装分类的独特子分类
      const womenClothingSubcategories = [
        '连衣裙', '半身裙', '毛衣', '内衣', '家居服'
      ];
      
      womenClothingSubcategories.forEach((subcategory) => {
        expect(screen.getByText(subcategory)).toBeInTheDocument();
      });
      
      // 验证手机分类的独特子分类
      const digitalSubcategories = [
        '平板电脑', '数码相机', '摄像机', '智能手表', '充电器'
      ];
      
      digitalSubcategories.forEach((subcategory) => {
        expect(screen.getByText(subcategory)).toBeInTheDocument();
      });
    });
  });
});