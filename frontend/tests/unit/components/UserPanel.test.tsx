import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import UserPanel from '../../../src/components/UserPanel';

describe('UserPanel', () => {
  it('should render login panel when not logged in', () => {
    render(<UserPanel isLoggedIn={false} />);
    
    // 检查欢迎文本
    expect(screen.getByText('Hi! 欢迎来到淘宝网')).toBeInTheDocument();
    
    // 检查登录和注册链接
    expect(screen.getByText('登录')).toBeInTheDocument();
    expect(screen.getByText('注册')).toBeInTheDocument();
    
    // 检查默认头像
    const avatar = screen.getByAltText('用户头像');
    expect(avatar).toBeInTheDocument();
  });

  it('should render user info when logged in', () => {
    const userName = '张三';
    const userAvatar = 'https://example.com/avatar.jpg';
    
    render(
      <UserPanel 
        isLoggedIn={true} 
        userName={userName} 
        userAvatar={userAvatar} 
      />
    );
    
    // 检查用户名
    expect(screen.getByText(`Hi! ${userName}`)).toBeInTheDocument();
    
    // 检查个人中心和退出登录链接
    expect(screen.getByText('个人中心')).toBeInTheDocument();
    expect(screen.getByText('退出登录')).toBeInTheDocument();
    
    // 检查用户头像
    const avatar = screen.getByAltText('用户头像') as HTMLImageElement;
    expect(avatar.src).toBe(userAvatar);
  });

  it('should use default avatar when no userAvatar provided', () => {
    render(<UserPanel isLoggedIn={true} userName="测试用户" />);
    
    const avatar = screen.getByAltText('用户头像') as HTMLImageElement;
    expect(avatar.src).toContain('data:image/svg+xml');
  });

  it('should call onLogin when login link is clicked', () => {
    const mockOnLogin = vi.fn();
    render(<UserPanel isLoggedIn={false} onLogin={mockOnLogin} />);
    
    const loginLink = screen.getByText('登录');
    fireEvent.click(loginLink);
    
    expect(mockOnLogin).toHaveBeenCalledTimes(1);
  });

  it('should call onRegister when register link is clicked', () => {
    const mockOnRegister = vi.fn();
    render(<UserPanel isLoggedIn={false} onRegister={mockOnRegister} />);
    
    const registerLink = screen.getByText('注册');
    fireEvent.click(registerLink);
    
    expect(mockOnRegister).toHaveBeenCalledTimes(1);
  });

  it('should prevent default behavior on login link click', () => {
    const mockOnLogin = vi.fn();
    render(<UserPanel isLoggedIn={false} onLogin={mockOnLogin} />);
    
    const loginLink = screen.getByText('登录');
    const clickEvent = new MouseEvent('click', { bubbles: true });
    const preventDefaultSpy = vi.spyOn(clickEvent, 'preventDefault');
    
    fireEvent(loginLink, clickEvent);
    
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should prevent default behavior on register link click', () => {
    const mockOnRegister = vi.fn();
    render(<UserPanel isLoggedIn={false} onRegister={mockOnRegister} />);
    
    const registerLink = screen.getByText('注册');
    const clickEvent = new MouseEvent('click', { bubbles: true });
    const preventDefaultSpy = vi.spyOn(clickEvent, 'preventDefault');
    
    fireEvent(registerLink, clickEvent);
    
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should render all user function links', () => {
    render(<UserPanel />);
    
    const expectedLinks = [
      '我的淘宝',
      '已买到的宝贝',
      '我的足迹',
      '收藏夹',
      '我的优惠券',
      '我的红包',
      '淘金币',
      '我要开店'
    ];
    
    expectedLinks.forEach(linkText => {
      expect(screen.getByText(linkText)).toBeInTheDocument();
    });
  });

  it('should handle missing onLogin callback gracefully', () => {
    render(<UserPanel isLoggedIn={false} />);
    
    const loginLink = screen.getByText('登录');
    
    // 应该不会抛出错误
    expect(() => {
      fireEvent.click(loginLink);
    }).not.toThrow();
  });

  it('should handle missing onRegister callback gracefully', () => {
    render(<UserPanel isLoggedIn={false} />);
    
    const registerLink = screen.getByText('注册');
    
    // 应该不会抛出错误
    expect(() => {
      fireEvent.click(registerLink);
    }).not.toThrow();
  });

  it('should render with default props', () => {
    render(<UserPanel />);
    
    // 默认应该是未登录状态
    expect(screen.getByText('Hi! 欢迎来到淘宝网')).toBeInTheDocument();
    expect(screen.getByText('登录')).toBeInTheDocument();
    expect(screen.getByText('注册')).toBeInTheDocument();
  });
});