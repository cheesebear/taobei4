import React, { useMemo } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Loading组件属性接口
 */
interface LoadingProps {
  /** 是否显示加载状态 */
  loading?: boolean;
  /** 加载文本 */
  text?: string;
  /** 尺寸大小 */
  size?: 'small' | 'medium' | 'large';
  /** 是否为行内显示 */
  inline?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 子组件 - 当loading为false时显示 */
  children?: React.ReactNode;
}

/**
 * 尺寸映射
 */
const sizeMap = {
  small: 'w-4 h-4',
  medium: 'w-6 h-6',
  large: 'w-8 h-8',
} as const;

/**
 * 通用Loading组件
 * 提供统一的加载状态显示
 */
export const Loading: React.FC<LoadingProps> = React.memo(
  ({
    loading = true,
    text = '加载中...',
    size = 'medium',
    inline = false,
    className = '',
    children,
  }) => {
    // 如果不是加载状态且有子组件，直接渲染子组件
    if (!loading && children) {
      return <>{children}</>;
    }

    // 如果不是加载状态且没有子组件，不渲染任何内容
    if (!loading) {
      return null;
    }

    const containerClass = useMemo(
      () =>
        inline
          ? `inline-flex items-center gap-2 ${className}`
          : `flex flex-col items-center justify-center gap-2 ${className}`,
      [inline, className]
    );

    const iconSize = useMemo(() => sizeMap[size], [size]);

    return (
      <div className={containerClass}>
        <Loader2 className={`${iconSize} animate-spin text-blue-500`} />
        {text && <span className='text-sm text-gray-600'>{text}</span>}
      </div>
    );
  }
);

Loading.displayName = 'Loading';

/**
 * 页面级Loading组件
 * 用于整个页面的加载状态
 */
export const PageLoading: React.FC<{ text?: string }> = React.memo(
  ({ text = '页面加载中...' }) => {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <Loading size='large' text={text} />
      </div>
    );
  }
);

PageLoading.displayName = 'PageLoading';

/**
 * 按钮Loading组件
 * 用于按钮的加载状态
 */
export const ButtonLoading: React.FC<{
  loading?: boolean;
  children: React.ReactNode;
}> = React.memo(({ loading = false, children }) => {
  return (
    <>
      {loading && <Loader2 className='w-4 h-4 animate-spin mr-2' />}
      {children}
    </>
  );
});

ButtonLoading.displayName = 'ButtonLoading';

/**
 * 卡片Loading组件
 * 用于卡片内容的加载状态
 */
export const CardLoading: React.FC<{ className?: string }> = React.memo(
  ({ className = '' }) => {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className='bg-gray-200 rounded-lg h-48 mb-4'></div>
        <div className='space-y-2'>
          <div className='bg-gray-200 rounded h-4 w-3/4'></div>
          <div className='bg-gray-200 rounded h-4 w-1/2'></div>
          <div className='bg-gray-200 rounded h-4 w-2/3'></div>
        </div>
      </div>
    );
  }
);

CardLoading.displayName = 'CardLoading';

/**
 * 列表Loading组件
 * 用于列表的骨架屏加载
 */
export const ListLoading: React.FC<{ count?: number; className?: string }> =
  React.memo(({ count = 3, className = '' }) => {
    const items = useMemo(() => Array.from({ length: count }), [count]);

    return (
      <div className={`space-y-4 ${className}`}>
        {items.map((_, index) => (
          <div key={index} className='animate-pulse flex space-x-4'>
            <div className='bg-gray-200 rounded-full h-12 w-12'></div>
            <div className='flex-1 space-y-2 py-1'>
              <div className='bg-gray-200 rounded h-4 w-3/4'></div>
              <div className='bg-gray-200 rounded h-4 w-1/2'></div>
            </div>
          </div>
        ))}
      </div>
    );
  });

ListLoading.displayName = 'ListLoading';

export default Loading;
