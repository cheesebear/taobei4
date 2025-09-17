# 淘贝课堂 - 快速开始指南

## 项目概述

淘贝课堂是一个简化版的电商Demo项目，专注于核心功能展示和教学演示。本项目采用现代Web技术栈，提供完整的前后端分离架构。

### 核心功能
- 用户注册/登录系统
- 商品展示和分类浏览
- 购物车管理
- 响应式UI设计

### 技术栈
- **前端**: React 18 + TypeScript + Vite
- **状态管理**: Zustand
- **路由**: React Router v6
- **UI组件**: Ant Design
- **样式**: CSS Modules + Tailwind CSS
- **后端Mock**: JSON Server + MSW
- **测试**: Vitest + React Testing Library
- **构建工具**: Vite

## 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0 或 yarn >= 1.22.0
- 现代浏览器 (Chrome 90+, Firefox 88+, Safari 14+)

## 快速启动

### 1. 克隆项目

```bash
git clone <repository-url>
cd taobei4
```

### 2. 安装依赖

```bash
# 使用 npm
npm install

# 或使用 yarn
yarn install
```

### 3. 启动开发服务器

```bash
# 启动前端开发服务器
npm run dev

# 启动Mock API服务器 (新终端)
npm run mock:server
```

### 4. 访问应用

- 前端应用: http://localhost:5173
- Mock API: http://localhost:3001
- API文档: http://localhost:3001/docs

## 项目结构

```
taobei4/
├── src/                    # 源代码目录
│   ├── components/         # 可复用组件
│   │   ├── common/         # 通用组件
│   │   ├── layout/         # 布局组件
│   │   └── ui/             # UI基础组件
│   ├── pages/              # 页面组件
│   │   ├── auth/           # 认证相关页面
│   │   ├── product/        # 商品相关页面
│   │   ├── cart/           # 购物车页面
│   │   └── user/           # 用户中心页面
│   ├── stores/             # 状态管理
│   │   ├── auth.ts         # 认证状态
│   │   ├── cart.ts         # 购物车状态
│   │   └── product.ts      # 商品状态
│   ├── services/           # API服务
│   │   ├── api.ts          # API配置
│   │   ├── auth.ts         # 认证API
│   │   ├── product.ts      # 商品API
│   │   └── cart.ts         # 购物车API
│   ├── hooks/              # 自定义Hooks
│   ├── utils/              # 工具函数
│   ├── types/              # TypeScript类型定义
│   ├── styles/             # 全局样式
│   └── assets/             # 静态资源
├── public/                 # 公共资源
├── mock/                   # Mock数据和服务
│   ├── data/               # Mock数据
│   ├── handlers/           # MSW处理器
│   └── server.js           # JSON Server配置
├── tests/                  # 测试文件
├── docs/                   # 项目文档
└── specs/                  # 规格文档
```

## 开发指南

### 代码规范

项目使用以下代码规范工具:
- **ESLint**: 代码质量检查
- **Prettier**: 代码格式化
- **TypeScript**: 类型检查
- **Husky**: Git hooks

```bash
# 代码检查
npm run lint

# 代码格式化
npm run format

# 类型检查
npm run type-check
```

### 组件开发

#### 1. 创建新组件

```typescript
// src/components/common/ProductCard.tsx
import React from 'react';
import { Card, Button } from 'antd';
import { Product } from '@/types/product';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onAddToCart 
}) => {
  return (
    <Card
      className={styles.card}
      cover={<img src={product.image} alt={product.title} />}
      actions={[
        <Button 
          type="primary" 
          onClick={() => onAddToCart(product.id)}
        >
          加入购物车
        </Button>
      ]}
    >
      <Card.Meta
        title={product.title}
        description={`¥${(product.price / 100).toFixed(2)}`}
      />
    </Card>
  );
};
```

#### 2. 状态管理

```typescript
// src/stores/cart.ts
import { create } from 'zustand';
import { CartItem, Product } from '@/types';

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  
  addItem: (product, quantity) => {
    set((state) => {
      const existingItem = state.items.find(item => item.productId === product.id);
      
      if (existingItem) {
        return {
          items: state.items.map(item =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        };
      }
      
      return {
        items: [...state.items, {
          id: `item_${Date.now()}`,
          productId: product.id,
          product,
          quantity,
          unitPrice: product.price,
          totalPrice: product.price * quantity
        }]
      };
    });
  },
  
  removeItem: (itemId) => {
    set((state) => ({
      items: state.items.filter(item => item.id !== itemId)
    }));
  },
  
  updateQuantity: (itemId, quantity) => {
    set((state) => ({
      items: state.items.map(item =>
        item.id === itemId
          ? { ...item, quantity, totalPrice: item.unitPrice * quantity }
          : item
      )
    }));
  },
  
  clearCart: () => set({ items: [] }),
  
  getTotalPrice: () => {
    const { items } = get();
    return items.reduce((total, item) => total + item.totalPrice, 0);
  }
}));
```

#### 3. API服务

```typescript
// src/services/product.ts
import { api } from './api';
import { Product, ProductListResponse } from '@/types/product';

export const productService = {
  // 获取商品列表
  getProducts: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    sortBy?: string;
  }): Promise<ProductListResponse> => {
    const response = await api.get('/products', { params });
    return response.data;
  },
  
  // 获取商品详情
  getProduct: async (productId: string): Promise<Product> => {
    const response = await api.get(`/products/${productId}`);
    return response.data.data;
  },
  
  // 获取分类列表
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  }
};
```

### 测试

#### 1. 单元测试

```typescript
// tests/components/ProductCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from '@/components/common/ProductCard';
import { mockProduct } from '../mocks/product';

describe('ProductCard', () => {
  const mockOnAddToCart = vi.fn();
  
  beforeEach(() => {
    mockOnAddToCart.mockClear();
  });
  
  it('renders product information correctly', () => {
    render(
      <ProductCard 
        product={mockProduct} 
        onAddToCart={mockOnAddToCart} 
      />
    );
    
    expect(screen.getByText(mockProduct.title)).toBeInTheDocument();
    expect(screen.getByText(`¥${(mockProduct.price / 100).toFixed(2)}`)).toBeInTheDocument();
  });
  
  it('calls onAddToCart when button is clicked', () => {
    render(
      <ProductCard 
        product={mockProduct} 
        onAddToCart={mockOnAddToCart} 
      />
    );
    
    fireEvent.click(screen.getByText('加入购物车'));
    expect(mockOnAddToCart).toHaveBeenCalledWith(mockProduct.id);
  });
});
```

#### 2. 运行测试

```bash
# 运行所有测试
npm run test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 监听模式运行测试
npm run test:watch
```

## 部署指南

### 1. 构建生产版本

```bash
# 构建项目
npm run build

# 预览构建结果
npm run preview
```

### 2. 静态部署

构建完成后，`dist` 目录包含所有静态文件，可以部署到任何静态文件服务器:

- **Vercel**: 连接GitHub仓库自动部署
- **Netlify**: 拖拽 `dist` 目录或连接Git
- **GitHub Pages**: 使用GitHub Actions自动部署
- **传统服务器**: 将 `dist` 目录内容上传到Web服务器

### 3. Docker部署

```dockerfile
# Dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
# 构建Docker镜像
docker build -t taobei-classroom .

# 运行容器
docker run -p 80:80 taobei-classroom
```

## 常见问题

### Q: 如何添加新的API接口？

A: 
1. 在 `mock/handlers/` 中添加MSW处理器
2. 在 `src/services/` 中添加对应的API服务函数
3. 在 `src/types/` 中定义相关的TypeScript类型
4. 更新API文档

### Q: 如何自定义主题样式？

A:
1. 修改 `src/styles/variables.css` 中的CSS变量
2. 在 `vite.config.ts` 中配置Ant Design主题
3. 使用Tailwind CSS的配置文件自定义工具类

### Q: 如何处理跨域问题？

A:
开发环境已在 `vite.config.ts` 中配置代理，生产环境需要:
1. 配置Nginx反向代理
2. 或在后端API中设置CORS头
3. 或使用同域部署

### Q: 如何优化性能？

A:
1. 使用React.memo包装组件
2. 实现虚拟滚动处理长列表
3. 使用代码分割和懒加载
4. 优化图片资源（WebP格式、懒加载）
5. 启用Gzip压缩

## 学习资源

- [React官方文档](https://react.dev/)
- [TypeScript手册](https://www.typescriptlang.org/docs/)
- [Vite指南](https://vitejs.dev/guide/)
- [Ant Design组件库](https://ant.design/components/overview-cn/)
- [Zustand状态管理](https://github.com/pmndrs/zustand)
- [React Router路由](https://reactrouter.com/)

## 贡献指南

1. Fork项目仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

## 许可证

本项目仅用于教学演示目的，请勿用于商业用途。

---

**快速开始完成！** 🎉

现在你可以开始探索淘贝课堂项目了。如有任何问题，请查看项目文档或提交Issue。