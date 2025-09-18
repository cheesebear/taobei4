import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * ErrorBoundary组件的Props接口
 */
interface ErrorBoundaryProps {
  /** 子组件 */
  children: ReactNode;
  /** 自定义错误UI */
  fallback?: (error: Error, errorInfo: ErrorInfo) => ReactNode;
  /** 错误回调函数 */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** 是否显示错误详情（仅开发环境） */
  showErrorDetails?: boolean;
}

/**
 * ErrorBoundary组件的State接口
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * 错误边界组件
 * 用于捕获和处理React组件树中的JavaScript错误
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   * 捕获错误并更新state
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * 组件捕获到错误时调用
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // 调用错误回调
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // 在开发环境下输出错误信息
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 ErrorBoundary caught an error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.groupEnd();
    }
  }

  /**
   * 重置错误状态
   */
  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  /**
   * 渲染方法
   */
  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, showErrorDetails = false } = this.props;

    if (hasError && error) {
      // 如果提供了自定义fallback，使用它
      if (fallback && errorInfo) {
        return fallback(error, errorInfo);
      }

      // 默认错误UI
      return (
        <div className='min-h-[400px] flex items-center justify-center p-8'>
          <div className='text-center max-w-md'>
            <div className='mb-6'>
              <AlertTriangle className='w-16 h-16 text-red-500 mx-auto mb-4' />
              <h2 className='text-2xl font-bold text-gray-900 mb-2'>
                出现了一些问题
              </h2>
              <p className='text-gray-600'>
                页面遇到了错误，请尝试刷新页面或联系技术支持。
              </p>
            </div>

            <div className='space-y-3'>
              <button
                onClick={this.resetError}
                className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
              >
                <RefreshCw className='w-4 h-4 mr-2' />
                重试
              </button>

              <button
                onClick={() => window.location.reload()}
                className='block w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
              >
                刷新页面
              </button>
            </div>

            {/* 开发环境下显示错误详情 */}
            {(process.env.NODE_ENV === 'development' || showErrorDetails) && (
              <details className='mt-6 text-left'>
                <summary className='cursor-pointer text-sm text-gray-500 hover:text-gray-700'>
                  查看错误详情
                </summary>
                <div className='mt-2 p-4 bg-gray-100 rounded-lg text-xs font-mono text-gray-800 overflow-auto max-h-40'>
                  <div className='mb-2'>
                    <strong>错误信息:</strong>
                    <pre className='whitespace-pre-wrap'>{error.message}</pre>
                  </div>
                  {error.stack && (
                    <div>
                      <strong>错误堆栈:</strong>
                      <pre className='whitespace-pre-wrap'>{error.stack}</pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return children;
  }
}

/**
 * 高阶组件：为组件添加错误边界
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

/**
 * Hook：在函数组件中使用错误边界
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  // 如果有错误，抛出它让ErrorBoundary捕获
  if (error) {
    throw error;
  }

  return { captureError, resetError };
}

export default ErrorBoundary;
