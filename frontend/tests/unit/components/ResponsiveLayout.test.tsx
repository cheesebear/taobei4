import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  ResponsiveLayout,
  ResponsiveGrid,
  MobileNav,
  ResponsiveCard,
  ResponsiveForm,
  ResponsiveInput,
  ResponsiveButton
} from '../../../src/components/ResponsiveLayout';

// Mock log utility
vi.mock('../../../src/utils', () => ({
  log: {
    info: vi.fn(),
    userAction: vi.fn()
  }
}));

// Mock window.innerWidth
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
});

// Mock window.addEventListener and removeEventListener
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();
Object.defineProperty(window, 'addEventListener', {
  writable: true,
  configurable: true,
  value: mockAddEventListener,
});
Object.defineProperty(window, 'removeEventListener', {
  writable: true,
  configurable: true,
  value: mockRemoveEventListener,
});

describe('ResponsiveLayout Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.innerWidth = 1024;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('ResponsiveLayout', () => {
    it('应该正确渲染响应式布局容器', () => {
      render(
        <ResponsiveLayout>
          <div>Test Content</div>
        </ResponsiveLayout>
      );
      
      expect(screen.getByText('Test Content')).toBeInTheDocument();
      const container = document.querySelector('.container');
      expect(container).toBeInTheDocument();
    });

    it('应该支持自定义className', () => {
      render(
        <ResponsiveLayout className="custom-class">
          <div>Test Content</div>
        </ResponsiveLayout>
      );
      
      const container = document.querySelector('.container.custom-class');
      expect(container).toBeInTheDocument();
    });

    it('应该监听窗口大小变化', () => {
      render(
        <ResponsiveLayout>
          <div>Test Content</div>
        </ResponsiveLayout>
      );
      
      expect(mockAddEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    });

    it('应该在组件卸载时移除事件监听器', () => {
      const { unmount } = render(
        <ResponsiveLayout>
          <div>Test Content</div>
        </ResponsiveLayout>
      );
      
      unmount();
      
      expect(mockRemoveEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    });
  });

  describe('ResponsiveGrid', () => {
    it('应该正确渲染网格容器', () => {
      render(
        <ResponsiveGrid>
          <div>Grid Item 1</div>
          <div>Grid Item 2</div>
        </ResponsiveGrid>
      );
      
      expect(screen.getByText('Grid Item 1')).toBeInTheDocument();
      expect(screen.getByText('Grid Item 2')).toBeInTheDocument();
      
      const grid = document.querySelector('.responsive-grid');
      expect(grid).toBeInTheDocument();
    });

    it('应该支持自定义列数配置', () => {
      const columns = { xs: 1, sm: 2, md: 3, lg: 4 };
      render(
        <ResponsiveGrid columns={columns}>
          <div>Grid Item</div>
        </ResponsiveGrid>
      );
      
      const grid = document.querySelector('.responsive-grid');
      expect(grid).toHaveStyle({
        '--grid-xs': 'repeat(1, 1fr)',
        '--grid-sm': 'repeat(2, 1fr)',
        '--grid-md': 'repeat(3, 1fr)',
        '--grid-lg': 'repeat(4, 1fr)'
      });
    });

    it('应该支持自定义间距', () => {
      render(
        <ResponsiveGrid gap={24}>
          <div>Grid Item</div>
        </ResponsiveGrid>
      );
      
      const grid = document.querySelector('.responsive-grid');
      expect(grid).toHaveStyle({ gap: '24px' });
    });
  });

  describe('MobileNav', () => {
    const mockItems = [
      { id: 'home', label: '首页', path: '/home' },
      { id: 'category', label: '分类', path: '/category', badge: 5 },
      { id: 'cart', label: '购物车', path: '/cart', badge: 2 },
      { id: 'profile', label: '我的', path: '/profile' }
    ];

    it('应该正确渲染移动端导航', () => {
      render(<MobileNav items={mockItems} />);
      
      expect(screen.getByText('首页')).toBeInTheDocument();
      expect(screen.getByText('分类')).toBeInTheDocument();
      expect(screen.getByText('购物车')).toBeInTheDocument();
      expect(screen.getByText('我的')).toBeInTheDocument();
    });

    it('应该显示徽章数字', () => {
      render(<MobileNav items={mockItems} />);
      
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('应该支持激活状态', () => {
      render(<MobileNav items={mockItems} activeItem="home" />);
      
      const homeButton = screen.getByText('首页').closest('button');
      expect(homeButton).toHaveClass('active');
    });

    it('应该支持点击回调', () => {
      const mockCallback = vi.fn();
      render(<MobileNav items={mockItems} onItemClick={mockCallback} />);
      
      fireEvent.click(screen.getByText('首页'));
      
      expect(mockCallback).toHaveBeenCalledWith(mockItems[0]);
    });
  });

  describe('ResponsiveCard', () => {
    it('应该正确渲染卡片', () => {
      render(
        <ResponsiveCard title="Test Card" subtitle="Test Subtitle">
          <div>Card Content</div>
        </ResponsiveCard>
      );
      
      expect(screen.getByText('Test Card')).toBeInTheDocument();
      expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
      expect(screen.getByText('Card Content')).toBeInTheDocument();
    });

    it('应该支持图片', () => {
      render(
        <ResponsiveCard 
          title="Test Card" 
          image="https://example.com/image.jpg"
        >
          <div>Card Content</div>
        </ResponsiveCard>
      );
      
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
      expect(image).toHaveAttribute('alt', 'Test Card');
    });

    it('应该支持操作按钮', () => {
      render(
        <ResponsiveCard 
          title="Test Card"
          actions={<button>Action Button</button>}
        >
          <div>Card Content</div>
        </ResponsiveCard>
      );
      
      expect(screen.getByText('Action Button')).toBeInTheDocument();
    });

    it('应该支持点击事件', () => {
      const mockClick = vi.fn();
      render(
        <ResponsiveCard title="Test Card" onClick={mockClick}>
          <div>Card Content</div>
        </ResponsiveCard>
      );
      
      fireEvent.click(screen.getByText('Card Content').closest('.mobile-card'));
      
      expect(mockClick).toHaveBeenCalled();
    });
  });

  describe('ResponsiveForm', () => {
    it('应该正确渲染表单', () => {
      render(
        <ResponsiveForm>
          <input type="text" placeholder="Test Input" />
        </ResponsiveForm>
      );
      
      expect(screen.getByPlaceholderText('Test Input')).toBeInTheDocument();
    });

    it('应该支持提交事件', () => {
      const mockSubmit = vi.fn();
      render(
        <ResponsiveForm onSubmit={mockSubmit}>
          <button type="submit">Submit</button>
        </ResponsiveForm>
      );
      
      fireEvent.click(screen.getByText('Submit'));
      
      expect(mockSubmit).toHaveBeenCalled();
    });
  });

  describe('ResponsiveInput', () => {
    it('应该正确渲染输入框', () => {
      render(
        <ResponsiveInput 
          label="Test Label" 
          placeholder="Test Placeholder"
        />
      );
      
      expect(screen.getByText('Test Label')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Test Placeholder')).toBeInTheDocument();
    });

    it('应该显示必填标记', () => {
      render(
        <ResponsiveInput 
          label="Required Field" 
          required
        />
      );
      
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('应该显示错误信息', () => {
      render(
        <ResponsiveInput 
          label="Test Field" 
          error="This field is required"
        />
      );
      
      expect(screen.getByText('This field is required')).toBeInTheDocument();
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('is-invalid');
    });

    it('应该支持值变化', () => {
      const mockChange = vi.fn();
      render(
        <ResponsiveInput 
          value="test" 
          onChange={mockChange}
        />
      );
      
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'new value' } });
      
      expect(mockChange).toHaveBeenCalledWith('new value');
    });
  });

  describe('ResponsiveButton', () => {
    it('应该正确渲染按钮', () => {
      render(
        <ResponsiveButton>
          Click Me
        </ResponsiveButton>
      );
      
      expect(screen.getByText('Click Me')).toBeInTheDocument();
    });

    it('应该支持不同变体', () => {
      render(
        <ResponsiveButton variant="secondary">
          Secondary Button
        </ResponsiveButton>
      );
      
      const button = screen.getByText('Secondary Button');
      expect(button).toHaveClass('btn-secondary');
    });

    it('应该支持不同尺寸', () => {
      render(
        <ResponsiveButton size="lg">
          Large Button
        </ResponsiveButton>
      );
      
      const button = screen.getByText('Large Button');
      expect(button).toHaveClass('btn-lg');
    });

    it('应该支持全宽度', () => {
      render(
        <ResponsiveButton fullWidth>
          Full Width Button
        </ResponsiveButton>
      );
      
      const button = screen.getByText('Full Width Button');
      expect(button).toHaveClass('w-100');
    });

    it('应该支持禁用状态', () => {
      render(
        <ResponsiveButton disabled>
          Disabled Button
        </ResponsiveButton>
      );
      
      const button = screen.getByText('Disabled Button');
      expect(button).toBeDisabled();
    });

    it('应该支持加载状态', () => {
      render(
        <ResponsiveButton loading>
          Loading Button
        </ResponsiveButton>
      );
      
      expect(screen.getByText('加载中...')).toBeInTheDocument();
      
      const button = screen.getByText('加载中...');
      expect(button).toBeDisabled();
    });

    it('应该支持点击事件', () => {
      const mockClick = vi.fn();
      render(
        <ResponsiveButton onClick={mockClick}>
          Click Me
        </ResponsiveButton>
      );
      
      fireEvent.click(screen.getByText('Click Me'));
      
      expect(mockClick).toHaveBeenCalled();
    });

    it('在禁用或加载状态下不应触发点击事件', () => {
      const mockClick = vi.fn();
      
      const { rerender } = render(
        <ResponsiveButton disabled onClick={mockClick}>
          Disabled Button
        </ResponsiveButton>
      );
      
      fireEvent.click(screen.getByText('Disabled Button'));
      expect(mockClick).not.toHaveBeenCalled();
      
      rerender(
        <ResponsiveButton loading onClick={mockClick}>
          Loading Button
        </ResponsiveButton>
      );
      
      fireEvent.click(screen.getByText('加载中...'));
      expect(mockClick).not.toHaveBeenCalled();
    });
  });
});