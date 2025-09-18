/**
 * 响应式布局组件
 * 展示响应式设计和移动端适配的使用
 */

import React, { useState, useEffect } from 'react';
import { log } from '../utils';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * 响应式布局容器
 */
export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  className = '',
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const newIsMobile = width <= 768;
      const newIsTablet = width > 768 && width <= 1024;

      if (newIsMobile !== isMobile) {
        setIsMobile(newIsMobile);
        log.info(
          `Screen size changed to: ${newIsMobile ? 'mobile' : 'desktop'}`,
          'RESPONSIVE'
        );
      }

      if (newIsTablet !== isTablet) {
        setIsTablet(newIsTablet);
      }
    };

    // 初始检查
    checkScreenSize();

    // 监听窗口大小变化
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, [isMobile, isTablet]);

  return <div className={`container ${className}`}>{children}</div>;
};

/**
 * 响应式网格组件
 */
interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
  gap?: number;
  className?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = 16,
  className = '',
}) => {
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gap: `${gap}px`,
    gridTemplateColumns: `repeat(${columns.xs || 1}, 1fr)`,
  };

  return (
    <div
      className={`responsive-grid ${className}`}
      style={
        {
          ...gridStyle,
          '--grid-xs': `repeat(${columns.xs || 1}, 1fr)`,
          '--grid-sm': `repeat(${columns.sm || 2}, 1fr)`,
          '--grid-md': `repeat(${columns.md || 3}, 1fr)`,
          '--grid-lg': `repeat(${columns.lg || 4}, 1fr)`,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
};

/**
 * 移动端导航组件
 */
interface MobileNavItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  path: string;
  badge?: number;
}

interface MobileNavProps {
  items: MobileNavItem[];
  activeItem?: string;
  onItemClick?: (item: MobileNavItem) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  items,
  activeItem,
  onItemClick,
}) => {
  const handleItemClick = (item: MobileNavItem) => {
    log.userAction('mobile_nav_click', { item: item.id });
    onItemClick?.(item);
  };

  return (
    <nav className='mobile-nav d-flex justify-content-around'>
      {items.map(item => (
        <button
          key={item.id}
          className={`mobile-nav-item touchable no-select ${
            activeItem === item.id ? 'active' : ''
          }`}
          onClick={() => handleItemClick(item)}
        >
          {item.icon && <div className='icon'>{item.icon}</div>}
          <span>{item.label}</span>
          {item.badge && item.badge > 0 && (
            <span className='badge'>{item.badge}</span>
          )}
        </button>
      ))}
    </nav>
  );
};

/**
 * 响应式卡片组件
 */
interface ResponsiveCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  image?: string;
  className?: string;
  onClick?: () => void;
}

export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  title,
  subtitle,
  children,
  actions,
  image,
  className = '',
  onClick,
}) => {
  const handleClick = () => {
    if (onClick) {
      log.userAction('card_click', { title });
      onClick();
    }
  };

  return (
    <div
      className={`mobile-card ${onClick ? 'touchable' : ''} ${className}`}
      onClick={handleClick}
    >
      {image && (
        <div className='card-image'>
          <img
            src={image}
            alt={title}
            className='w-100'
            style={{ height: '200px', objectFit: 'cover' }}
          />
        </div>
      )}

      {(title || subtitle) && (
        <div className='mobile-card-header'>
          <div>
            {title && <h3 className='mobile-card-title'>{title}</h3>}
            {subtitle && <p className='mobile-card-subtitle'>{subtitle}</p>}
          </div>
        </div>
      )}

      <div className='mobile-card-content'>{children}</div>

      {actions && <div className='mobile-card-footer'>{actions}</div>}
    </div>
  );
};

/**
 * 响应式表单组件
 */
interface ResponsiveFormProps {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
}

export const ResponsiveForm: React.FC<ResponsiveFormProps> = ({
  children,
  onSubmit,
  className = '',
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    log.userAction('form_submit');
    onSubmit?.(e);
  };

  return (
    <form className={`mobile-form ${className}`} onSubmit={handleSubmit}>
      {children}
    </form>
  );
};

/**
 * 响应式输入组件
 */
interface ResponsiveInputProps {
  label?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  error?: string;
  className?: string;
}

export const ResponsiveInput: React.FC<ResponsiveInputProps> = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  required,
  error,
  className = '',
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div className={`mobile-form-group ${className}`}>
      {label && (
        <label className='mobile-form-label'>
          {label}
          {required && <span className='text-danger'>*</span>}
        </label>
      )}
      <input
        type={type}
        className={`mobile-form-input ${error ? 'is-invalid' : ''}`}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        required={required}
      />
      {error && (
        <div className='invalid-feedback text-danger mt-1'>{error}</div>
      )}
    </div>
  );
};

/**
 * 响应式按钮组件
 */
interface ResponsiveButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'link';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

export const ResponsiveButton: React.FC<ResponsiveButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  onClick,
  className = '',
}) => {
  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      log.userAction('button_click', { variant, size });
      onClick();
    }
  };

  const buttonClass = [
    'mobile-form-button',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth ? 'w-100' : '',
    loading ? 'loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={buttonClass}
      disabled={disabled || loading}
      onClick={handleClick}
    >
      {loading ? (
        <>
          <span className='loading-spinner'></span>
          加载中...
        </>
      ) : (
        children
      )}
    </button>
  );
};

// 导出所有组件
export default {
  ResponsiveLayout,
  ResponsiveGrid,
  MobileNav,
  ResponsiveCard,
  ResponsiveForm,
  ResponsiveInput,
  ResponsiveButton,
};
