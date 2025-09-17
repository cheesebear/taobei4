# Data Model: 淘贝课堂电商平台

**Feature**: 淘贝课堂电商平台 (简化版Demo)  
**Date**: 2024-01-17  
**Phase**: 1 - Design & Contracts

## 核心实体设计

### User (用户)

**描述**: 平台用户账户信息

**字段**:
```typescript
interface User {
  id: string;                    // 用户唯一标识
  phone: string;                 // 手机号 (11位)
  username?: string;             // 用户名 (可选)
  password: string;              // 密码哈希 (MD5)
  email?: string;                // 邮箱 (可选)
  avatar?: string;               // 头像URL (可选)
  createdAt: Date;               // 注册时间
  lastLoginAt?: Date;            // 最后登录时间
  isActive: boolean;             // 账户状态
}
```

**验证规则**:
- phone: 必填，11位数字，格式验证
- password: 必填，6-20位字符
- email: 可选，邮箱格式验证
- username: 可选，2-20位字符

**状态转换**:
- 注册 → 激活状态
- 登录 → 更新最后登录时间
- 注销 → 保持激活状态 (Demo简化)

### Product (商品)

**描述**: 商品基本信息，使用固定数据集

**字段**:
```typescript
interface Product {
  id: string;                    // 商品唯一标识
  title: string;                 // 商品标题
  price: number;                 // 商品价格 (分为单位)
  originalPrice?: number;        // 原价 (可选，用于显示折扣)
  description: string;           // 商品描述
  images: string[];              // 商品图片URL数组
  category: string;              // 商品分类ID
  shopId: string;                // 店铺ID
  specifications: ProductSpec[]; // 商品规格
  stock: number;                 // 库存数量 (Demo中假设充足)
  sales: number;                 // 销量统计
  rating: number;                // 商品评分 (1-5)
  reviewCount: number;           // 评价数量
  tags: string[];                // 商品标签
  isActive: boolean;             // 商品状态
  createdAt: Date;               // 创建时间
  updatedAt: Date;               // 更新时间
}

interface ProductSpec {
  name: string;                  // 规格名称 (如: 颜色, 尺寸)
  options: SpecOption[];         // 规格选项
}

interface SpecOption {
  value: string;                 // 选项值 (如: 红色, XL)
  price?: number;                // 价格差异 (可选)
  stock?: number;                // 该规格库存 (可选)
  image?: string;                // 规格图片 (可选)
}
```

**验证规则**:
- title: 必填，1-100字符
- price: 必填，正数
- images: 至少1张图片
- stock: 非负整数
- rating: 1-5之间的数字

**固定数据示例**:
- iPhone 17 Pro Max
- MacBook Pro M4
- AirPods Pro 3
- iPad Air 6
- Apple Watch Series 10
- 等10-20个商品

### CartItem (购物车项)

**描述**: 用户购物车中的商品项

**字段**:
```typescript
interface CartItem {
  id: string;                    // 购物车项唯一标识
  userId: string;                // 用户ID
  productId: string;             // 商品ID
  selectedSpecs: SelectedSpec[]; // 选择的规格
  quantity: number;              // 商品数量
  addedAt: Date;                 // 添加时间
  updatedAt: Date;               // 更新时间
}

interface SelectedSpec {
  specName: string;              // 规格名称
  optionValue: string;           // 选择的选项值
}
```

**验证规则**:
- quantity: 正整数，1-99
- selectedSpecs: 必须包含所有必选规格
- userId: 必填，关联用户
- productId: 必填，关联商品

**状态转换**:
- 添加商品 → 创建购物车项
- 修改数量 → 更新购物车项
- 删除商品 → 移除购物车项
- 清空购物车 → 删除所有项

### Category (商品分类)

**描述**: 商品分类信息，支持多级分类

**字段**:
```typescript
interface Category {
  id: string;                    // 分类唯一标识
  name: string;                  // 分类名称
  parentId?: string;             // 父分类ID (可选)
  level: number;                 // 分类层级 (1-3)
  icon?: string;                 // 分类图标URL (可选)
  image?: string;                // 分类图片URL (可选)
  sortOrder: number;             // 排序权重
  isActive: boolean;             // 分类状态
  productCount: number;          // 商品数量统计
}
```

**验证规则**:
- name: 必填，1-50字符
- level: 1-3之间的整数
- sortOrder: 非负整数

**分类层级示例**:
```
数码产品 (L1)
├── 手机通讯 (L2)
│   ├── 手机 (L3)
│   └── 配件 (L3)
├── 电脑办公 (L2)
│   ├── 笔记本 (L3)
│   └── 台式机 (L3)
└── 智能设备 (L2)
    ├── 智能手表 (L3)
    └── 耳机音响 (L3)
```

### Shop (店铺)

**描述**: 商品所属店铺信息

**字段**:
```typescript
interface Shop {
  id: string;                    // 店铺唯一标识
  name: string;                  // 店铺名称
  logo?: string;                 // 店铺Logo URL (可选)
  description?: string;          // 店铺描述 (可选)
  rating: number;                // 店铺评分 (1-5)
  productCount: number;          // 商品数量
  followerCount: number;         // 关注人数
  serviceRating: ServiceRating;  // 服务评分
  isOfficial: boolean;           // 是否官方店铺
  createdAt: Date;               // 创建时间
}

interface ServiceRating {
  description: number;           // 描述相符 (1-5)
  service: number;               // 服务态度 (1-5)
  logistics: number;             // 物流服务 (1-5)
}
```

**验证规则**:
- name: 必填，1-50字符
- rating: 1-5之间的数字
- serviceRating: 各项评分1-5之间

## 关系设计

### 实体关系图
```
User (1) ----< (N) CartItem (N) >---- (1) Product
                                           |
                                           |
Category (1) ----< (N) Product (N) >---- (1) Shop
```

### 关系说明
- User : CartItem = 1 : N (一个用户可以有多个购物车项)
- Product : CartItem = 1 : N (一个商品可以被多个用户添加到购物车)
- Category : Product = 1 : N (一个分类包含多个商品)
- Shop : Product = 1 : N (一个店铺有多个商品)

## 数据存储策略

### 前端存储 (localStorage)

**用户数据**:
```javascript
// 当前登录用户
localStorage.setItem('currentUser', JSON.stringify(user));

// 用户登录状态
localStorage.setItem('isLoggedIn', 'true');

// 记住登录状态
localStorage.setItem('rememberLogin', 'true');
```

**购物车数据**:
```javascript
// 购物车项目列表
localStorage.setItem('cartItems', JSON.stringify(cartItems));

// 购物车统计信息
localStorage.setItem('cartSummary', JSON.stringify({
  totalItems: number,
  totalPrice: number,
  updatedAt: Date
}));
```

### Mock数据服务

**商品数据**: 静态JSON文件，包含10-20个固定商品  
**分类数据**: 静态JSON文件，3级分类结构  
**店铺数据**: 静态JSON文件，5-10个模拟店铺

## 数据验证

### 前端验证
```typescript
// 用户输入验证
const validatePhone = (phone: string): boolean => {
  return /^1[3-9]\d{9}$/.test(phone);
};

const validatePassword = (password: string): boolean => {
  return password.length >= 6 && password.length <= 20;
};

// 购物车验证
const validateQuantity = (quantity: number): boolean => {
  return Number.isInteger(quantity) && quantity > 0 && quantity <= 99;
};
```

### 数据完整性
- 外键关联检查 (productId, userId等)
- 必填字段验证
- 数据类型验证
- 业务规则验证 (如库存检查)

## 性能考虑

### 数据缓存
- 商品列表缓存 (5分钟)
- 分类数据缓存 (30分钟)
- 用户信息缓存 (登录期间)

### 数据分页
- 商品列表: 每页20个商品
- 搜索结果: 每页15个商品
- 评价列表: 每页10条评价

### 懒加载
- 商品图片懒加载
- 分类数据按需加载
- 用户操作历史延迟加载

## 数据迁移

由于是Demo项目，不涉及复杂的数据迁移。如需扩展:

1. **版本控制**: 使用语义化版本号
2. **向后兼容**: 保持API接口稳定
3. **数据备份**: localStorage数据导出功能
4. **渐进升级**: 新功能可选启用

## 总结

本数据模型设计平衡了功能完整性和实现复杂度，适合教学演示项目的需求。通过合理的实体设计和关系定义，支持核心电商功能的实现，同时保持代码的可维护性和扩展性。

**下一步**: 基于数据模型生成API合约和接口定义。