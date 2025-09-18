/**
 * 性能优化工具函数
 * 提供代码分割、懒加载、缓存等性能优化功能
 */

import { lazy, ComponentType } from 'react';
import { logger } from './logger';

/**
 * 懒加载组件工具
 */
export class LazyLoader {
  private static loadingCache = new Map<string, Promise<any>>();

  /**
   * 创建懒加载组件
   * @param importFn 动态导入函数
   * @param componentName 组件名称（用于调试）
   * @returns 懒加载组件
   */
  static createLazyComponent<T extends ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    componentName?: string
  ): ComponentType<any> {
    return lazy(async () => {
      const startTime = performance.now();

      try {
        const module = await importFn();
        const loadTime = performance.now() - startTime;

        logger.logPerformance(
          `Lazy load component: ${componentName || 'Unknown'}`,
          loadTime
        );

        return module;
      } catch (error) {
        logger.error(
          `Failed to lazy load component: ${componentName || 'Unknown'}`,
          error,
          'LAZY_LOAD'
        );
        throw error;
      }
    });
  }

  /**
   * 预加载组件
   * @param importFn 动态导入函数
   * @param key 缓存键
   */
  static preloadComponent(
    importFn: () => Promise<any>,
    key: string
  ): Promise<any> {
    if (this.loadingCache.has(key)) {
      return this.loadingCache.get(key)!;
    }

    const promise = importFn().catch(error => {
      logger.error(`Failed to preload component: ${key}`, error, 'PRELOAD');
      this.loadingCache.delete(key);
      throw error;
    });

    this.loadingCache.set(key, promise);
    return promise;
  }
}

/**
 * 缓存管理器
 */
export class CacheManager {
  private static memoryCache = new Map<string, any>();
  private static cacheTimestamps = new Map<string, number>();

  /**
   * 设置内存缓存
   * @param key 缓存键
   * @param value 缓存值
   * @param ttl 过期时间（毫秒）
   */
  static setMemoryCache(
    key: string,
    value: any,
    ttl: number = 5 * 60 * 1000
  ): void {
    this.memoryCache.set(key, value);
    this.cacheTimestamps.set(key, Date.now() + ttl);
  }

  /**
   * 获取内存缓存
   * @param key 缓存键
   * @returns 缓存值或null
   */
  static getMemoryCache(key: string): any {
    const timestamp = this.cacheTimestamps.get(key);

    if (!timestamp || Date.now() > timestamp) {
      this.memoryCache.delete(key);
      this.cacheTimestamps.delete(key);
      return null;
    }

    return this.memoryCache.get(key);
  }

  /**
   * 清除过期缓存
   */
  static clearExpiredCache(): void {
    const now = Date.now();

    for (const [key, timestamp] of this.cacheTimestamps.entries()) {
      if (now > timestamp) {
        this.memoryCache.delete(key);
        this.cacheTimestamps.delete(key);
      }
    }
  }

  /**
   * 清除所有缓存
   */
  static clearAllCache(): void {
    this.memoryCache.clear();
    this.cacheTimestamps.clear();
  }

  /**
   * 获取缓存统计信息
   */
  static getCacheStats(): {
    totalItems: number;
    memoryUsage: number;
    expiredItems: number;
  } {
    const now = Date.now();
    let expiredItems = 0;

    for (const timestamp of this.cacheTimestamps.values()) {
      if (now > timestamp) {
        expiredItems++;
      }
    }

    return {
      totalItems: this.memoryCache.size,
      memoryUsage: JSON.stringify([...this.memoryCache.entries()]).length,
      expiredItems,
    };
  }
}

/**
 * 图片懒加载工具
 */
export class ImageLazyLoader {
  private static observer: IntersectionObserver | null = null;
  private static loadedImages = new Set<string>();

  /**
   * 初始化图片懒加载观察器
   */
  static init(): void {
    if (this.observer || typeof window === 'undefined') {
      return;
    }

    this.observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            this.loadImage(img);
            this.observer!.unobserve(img);
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.1,
      }
    );
  }

  /**
   * 观察图片元素
   * @param img 图片元素
   */
  static observe(img: HTMLImageElement): void {
    if (!this.observer) {
      this.init();
    }

    if (this.observer && img.dataset.src) {
      this.observer.observe(img);
    }
  }

  /**
   * 加载图片
   * @param img 图片元素
   */
  private static loadImage(img: HTMLImageElement): void {
    const src = img.dataset.src;
    if (!src || this.loadedImages.has(src)) {
      return;
    }

    const startTime = performance.now();

    img.onload = () => {
      const loadTime = performance.now() - startTime;
      logger.logPerformance(`Image loaded: ${src}`, loadTime);

      img.classList.add('loaded');
      this.loadedImages.add(src);
    };

    img.onerror = () => {
      logger.error(
        `Failed to load image: ${src}`,
        new Error('Image load failed'),
        'IMAGE_LOAD'
      );
      img.classList.add('error');
    };

    img.src = src;
  }

  /**
   * 预加载图片
   * @param urls 图片URL数组
   */
  static preloadImages(urls: string[]): Promise<void[]> {
    return Promise.all(
      urls.map(url => {
        if (this.loadedImages.has(url)) {
          return Promise.resolve();
        }

        return new Promise<void>((resolve, reject) => {
          const img = new Image();

          img.onload = () => {
            this.loadedImages.add(url);
            resolve();
          };

          img.onerror = () => {
            logger.error(
              `Failed to preload image: ${url}`,
              new Error('Image preload failed'),
              'IMAGE_PRELOAD'
            );
            reject(new Error(`Failed to preload image: ${url}`));
          };

          img.src = url;
        });
      })
    );
  }
}

/**
 * 资源预加载工具
 */
export class ResourcePreloader {
  /**
   * 预加载CSS文件
   * @param href CSS文件URL
   */
  static preloadCSS(href: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = href;

      link.onload = () => {
        // 将预加载的CSS转换为实际的样式表
        link.rel = 'stylesheet';
        resolve();
      };

      link.onerror = () => {
        logger.error(
          `Failed to preload CSS: ${href}`,
          new Error('CSS preload failed'),
          'CSS_PRELOAD'
        );
        reject(new Error(`Failed to preload CSS: ${href}`));
      };

      document.head.appendChild(link);
    });
  }

  /**
   * 预加载JavaScript文件
   * @param src JavaScript文件URL
   */
  static preloadJS(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'script';
      link.href = src;

      link.onload = () => resolve();
      link.onerror = () => {
        logger.error(
          `Failed to preload JS: ${src}`,
          new Error('JS preload failed'),
          'JS_PRELOAD'
        );
        reject(new Error(`Failed to preload JS: ${src}`));
      };

      document.head.appendChild(link);
    });
  }

  /**
   * 预连接到域名
   * @param href 域名URL
   */
  static preconnect(href: string): void {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = href;
    document.head.appendChild(link);
  }

  /**
   * DNS预解析
   * @param href 域名URL
   */
  static dnsPrefetch(href: string): void {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = href;
    document.head.appendChild(link);
  }
}

/**
 * 性能监控工具
 */
export class PerformanceMonitor {
  private static metrics = new Map<string, number[]>();

  /**
   * 记录性能指标
   * @param name 指标名称
   * @param value 指标值
   */
  static recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const values = this.metrics.get(name)!;
    values.push(value);

    // 只保留最近100个值
    if (values.length > 100) {
      values.shift();
    }
  }

  /**
   * 获取性能统计
   * @param name 指标名称
   */
  static getMetricStats(name: string): {
    count: number;
    average: number;
    min: number;
    max: number;
    p95: number;
  } | null {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) {
      return null;
    }

    const sorted = [...values].sort((a, b) => a - b);
    const count = values.length;
    const sum = values.reduce((a, b) => a + b, 0);
    const average = sum / count;
    const min = sorted[0];
    const max = sorted[count - 1];
    const p95Index = Math.floor(count * 0.95);
    const p95 = sorted[p95Index];

    return { count, average, min, max, p95 };
  }

  /**
   * 获取所有性能指标
   */
  static getAllMetrics(): Record<string, any> {
    const result: Record<string, any> = {};

    for (const [name] of this.metrics.entries()) {
      result[name] = this.getMetricStats(name);
    }

    return result;
  }

  /**
   * 监控页面性能
   */
  static monitorPagePerformance(): void {
    if (typeof window === 'undefined' || !window.performance) {
      return;
    }

    // 监控页面加载时间
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType(
          'navigation'
        )[0] as PerformanceNavigationTiming;

        if (navigation) {
          this.recordMetric(
            'page_load_time',
            navigation.loadEventEnd - navigation.fetchStart
          );
          this.recordMetric(
            'dom_content_loaded',
            navigation.domContentLoadedEventEnd - navigation.fetchStart
          );
          this.recordMetric(
            'first_paint',
            navigation.responseEnd - navigation.fetchStart
          );
        }
      }, 0);
    });

    // 监控资源加载时间
    const observer = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          const resource = entry as PerformanceResourceTiming;
          this.recordMetric(
            `resource_${resource.initiatorType}`,
            resource.duration
          );
        }
      }
    });

    observer.observe({ entryTypes: ['resource'] });
  }
}

/**
 * 内存管理工具
 */
export class MemoryManager {
  private static cleanupTasks: (() => void)[] = [];

  /**
   * 注册清理任务
   * @param cleanup 清理函数
   */
  static registerCleanup(cleanup: () => void): void {
    this.cleanupTasks.push(cleanup);
  }

  /**
   * 执行内存清理
   */
  static cleanup(): void {
    // 清理缓存
    CacheManager.clearExpiredCache();

    // 执行注册的清理任务
    this.cleanupTasks.forEach(task => {
      try {
        task();
      } catch (error) {
        logger.error('Memory cleanup task failed', error, 'MEMORY_CLEANUP');
      }
    });

    // 建议垃圾回收（仅在开发环境）
    if (process.env.NODE_ENV === 'development' && (window as any).gc) {
      (window as any).gc();
    }
  }

  /**
   * 获取内存使用情况
   */
  static getMemoryUsage(): {
    usedJSHeapSize?: number;
    totalJSHeapSize?: number;
    jsHeapSizeLimit?: number;
  } {
    if (typeof window !== 'undefined' && (performance as any).memory) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      };
    }

    return {};
  }

  /**
   * 监控内存使用
   */
  static monitorMemoryUsage(): void {
    if (typeof window === 'undefined') {
      return;
    }

    setInterval(() => {
      const usage = this.getMemoryUsage();
      if (usage.usedJSHeapSize) {
        PerformanceMonitor.recordMetric('memory_usage', usage.usedJSHeapSize);

        // 如果内存使用过高，执行清理
        if (usage.usedJSHeapSize > (usage.jsHeapSizeLimit || 0) * 0.8) {
          logger.warn(
            'High memory usage detected, performing cleanup',
            'MEMORY'
          );
          this.cleanup();
        }
      }
    }, 30000); // 每30秒检查一次
  }
}

// 初始化性能监控
if (
  typeof window !== 'undefined' &&
  typeof IntersectionObserver !== 'undefined'
) {
  PerformanceMonitor.monitorPagePerformance();
  MemoryManager.monitorMemoryUsage();
  ImageLazyLoader.init();
}

// 导出所有工具
export const performanceUtils = {
  LazyLoader,
  CacheManager,
  ImageLazyLoader,
  ResourcePreloader,
  PerformanceMonitor,
  MemoryManager,
};
