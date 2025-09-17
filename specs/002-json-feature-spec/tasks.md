# Tasks: 淘贝课堂电商平台 (简化版Demo)

**Input**: Design documents from `/specs/002-json-feature-spec/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## 执行流程概述

本文档基于设计阶段生成的文档，将淘贝课堂项目拆分为最小可验证的任务单元。每个任务都有明确的输入、输出和验收标准，支持TDD开发模式和并行执行。

## 任务格式说明

- **[P]**: 可并行执行的任务（不同文件，无依赖关系）
- **文件路径**: 每个任务都包含确切的文件路径
- **依赖关系**: 明确标注任务间的依赖关系

## 项目结构

基于plan.md中的结构决策，采用Web应用架构：
```
frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── stores/
│   ├── services/
│   ├── types/
│   └── utils/
└── tests/
    ├── contract/
    ├── integration/
    └── unit/

backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/
```

## Phase 3.1: 项目设置和基础架构

- [ ] **T001** 创建项目目录结构
  - 创建 `frontend/` 和 `backend/` 目录
  - 初始化基础文件夹结构
  - 创建 `.gitignore` 和基础配置文件

- [ ] **T002** [P] 初始化前端项目
  - 在 `frontend/` 目录初始化React + TypeScript + Vite项目
  - 安装依赖：React 18, TypeScript, Vite, React Router, Zustand, Ant Design
  - 配置 `vite.config.ts` 和 `tsconfig.json`

- [ ] **T003** [P] 初始化后端Mock服务
  - 在 `backend/` 目录设置JSON Server + MSW
  - 创建 `package.json` 和基础配置
  - 安装依赖：json-server, msw, cors

- [ ] **T004** [P] 配置开发工具
  - 设置ESLint, Prettier配置文件
  - 配置Husky git hooks
  - 创建 `scripts/` 目录和开发脚本

## Phase 3.2: 测试优先开发 (TDD) ⚠️ 必须在实现前完成

**关键要求**: 这些测试必须先编写并且必须失败，然后才能进行任何实现工作

### API合约测试

- [ ] **T005** [P] 用户注册API合约测试
  - 文件：`frontend/tests/contract/auth-register.test.ts`
  - 测试POST `/api/auth/register`接口
  - 验证请求/响应schema，错误处理

- [ ] **T006** [P] 用户登录API合约测试
  - 文件：`frontend/tests/contract/auth-login.test.ts`
  - 测试POST `/api/auth/login`接口
  - 验证认证流程和token返回

- [ ] **T007** [P] 用户登出API合约测试
  - 文件：`frontend/tests/contract/auth-logout.test.ts`
  - 测试POST `/api/auth/logout`接口
  - 验证认证头和响应格式

- [ ] **T008** [P] 验证码API合约测试
  - 文件：`frontend/tests/contract/auth-verify-code.test.ts`
  - 测试POST `/api/auth/verify-code`接口
  - 验证手机号格式和响应

- [ ] **T009** [P] 商品列表API合约测试
  - 文件：`frontend/tests/contract/products-list.test.ts`
  - 测试GET `/api/products`接口
  - 验证分页、筛选、排序参数

- [ ] **T010** [P] 商品详情API合约测试
  - 文件：`frontend/tests/contract/products-detail.test.ts`
  - 测试GET `/api/products/{id}`接口
  - 验证商品详情数据结构

- [ ] **T011** [P] 购物车获取API合约测试
  - 文件：`frontend/tests/contract/cart-get.test.ts`
  - 测试GET `/api/cart`接口
  - 验证认证和购物车数据结构

- [ ] **T012** [P] 购物车添加API合约测试
  - 文件：`frontend/tests/contract/cart-add.test.ts`
  - 测试POST `/api/cart`接口
  - 验证商品添加逻辑和响应

- [ ] **T013** [P] 购物车更新API合约测试
  - 文件：`frontend/tests/contract/cart-update.test.ts`
  - 测试PUT `/api/cart/items/{id}`接口
  - 验证数量更新和规格变更

### 集成测试场景

- [ ] **T014** [P] 用户注册流程集成测试
  - 文件：`frontend/tests/integration/user-registration.test.ts`
  - 测试完整注册流程：验证码→注册→自动登录
  - 验证UI交互和状态管理

- [ ] **T015** [P] 用户登录流程集成测试
  - 文件：`frontend/tests/integration/user-login.test.ts`
  - 测试登录→记住状态→页面跳转流程
  - 验证认证状态持久化

- [ ] **T016** [P] 商品浏览流程集成测试
  - 文件：`frontend/tests/integration/product-browsing.test.ts`
  - 测试分类浏览→商品列表→商品详情流程
  - 验证筛选、排序、分页功能

- [ ] **T017** [P] 购物车操作流程集成测试
  - 文件：`frontend/tests/integration/cart-operations.test.ts`
  - 测试添加→修改→删除→清空购物车流程
  - 验证数量计算和价格统计

## Phase 3.3: 核心实现 (仅在测试失败后执行)

### 数据模型和类型定义

- [ ] **T018** [P] 用户相关类型定义
  - 文件：`frontend/src/types/user.ts`
  - 定义User, UserProfile, LoginRequest等接口
  - 基于data-model.md中的User实体

- [ ] **T019** [P] 商品相关类型定义
  - 文件：`frontend/src/types/product.ts`
  - 定义Product, ProductSummary, Category, Shop等接口
  - 基于data-model.md中的Product实体

- [ ] **T020** [P] 购物车相关类型定义
  - 文件：`frontend/src/types/cart.ts`
  - 定义CartItem, Cart, AddToCartRequest等接口
  - 基于data-model.md中的CartItem实体

### 状态管理

- [ ] **T021** [P] 用户认证状态管理
  - 文件：`frontend/src/stores/auth.ts`
  - 实现用户登录、登出、状态持久化
  - 使用Zustand管理认证状态

- [ ] **T022** [P] 商品数据状态管理
  - 文件：`frontend/src/stores/product.ts`
  - 实现商品列表、详情、分类数据管理
  - 包含缓存和分页逻辑

- [ ] **T023** [P] 购物车状态管理
  - 文件：`frontend/src/stores/cart.ts`
  - 实现购物车CRUD操作和本地存储
  - 包含价格计算和数量统计

### API服务层

- [ ] **T024** [P] API基础配置
  - 文件：`frontend/src/services/api.ts`
  - 配置axios实例、拦截器、错误处理
  - 实现认证token自动添加

- [ ] **T025** [P] 用户认证API服务
  - 文件：`frontend/src/services/auth.ts`
  - 实现注册、登录、登出、验证码API调用
  - 依赖T024 API基础配置

- [ ] **T026** [P] 商品API服务
  - 文件：`frontend/src/services/product.ts`
  - 实现商品列表、详情、分类API调用
  - 依赖T024 API基础配置

- [ ] **T027** [P] 购物车API服务
  - 文件：`frontend/src/services/cart.ts`
  - 实现购物车CRUD操作API调用
  - 依赖T024 API基础配置

### Mock数据和服务

- [ ] **T028** [P] 用户Mock数据
  - 文件：`backend/src/data/users.json`
  - 创建用户测试数据和MSW处理器
  - 实现认证相关Mock接口

- [ ] **T029** [P] 商品Mock数据
  - 文件：`backend/src/data/products.json`
  - 创建10-20个商品的完整数据
  - 包含图片、规格、分类信息

- [ ] **T030** [P] 分类和店铺Mock数据
  - 文件：`backend/src/data/categories.json`, `backend/src/data/shops.json`
  - 创建3级分类结构和店铺信息
  - 建立与商品的关联关系

### UI组件实现

- [ ] **T031** [P] 通用UI组件
  - 文件：`frontend/src/components/ui/`
  - 实现Button, Input, Card等基础组件
  - 基于Ant Design进行定制

- [ ] **T032** [P] 布局组件
  - 文件：`frontend/src/components/layout/`
  - 实现Header, Footer, Sidebar等布局组件
  - 包含导航和用户状态显示

- [ ] **T033** 用户认证页面
  - 文件：`frontend/src/pages/auth/`
  - 实现登录、注册页面组件
  - 集成认证状态管理和API调用
  - 依赖T021, T025

- [ ] **T034** 商品列表页面
  - 文件：`frontend/src/pages/product/ProductList.tsx`
  - 实现商品列表展示、筛选、排序
  - 集成商品状态管理和API调用
  - 依赖T022, T026

- [ ] **T035** 商品详情页面
  - 文件：`frontend/src/pages/product/ProductDetail.tsx`
  - 实现商品详情展示和规格选择
  - 集成购物车添加功能
  - 依赖T022, T023, T026, T027

- [ ] **T036** 购物车页面
  - 文件：`frontend/src/pages/cart/Cart.tsx`
  - 实现购物车列表、数量修改、删除
  - 集成购物车状态管理和API调用
  - 依赖T023, T027

### 路由配置

- [ ] **T037** 应用路由配置
  - 文件：`frontend/src/App.tsx`, `frontend/src/router/index.tsx`
  - 配置React Router路由
  - 实现路由守卫和认证检查
  - 依赖所有页面组件 (T033-T036)

## Phase 3.4: 集成和优化

- [ ] **T038** Mock服务器集成
  - 文件：`backend/src/server.js`
  - 配置JSON Server和MSW集成
  - 实现CORS和请求日志
  - 依赖所有Mock数据 (T028-T030)

- [ ] **T039** 错误处理和日志
  - 文件：`frontend/src/utils/error-handler.ts`
  - 实现全局错误处理和用户友好提示
  - 添加请求/响应日志

- [ ] **T040** 响应式设计优化
  - 文件：`frontend/src/styles/responsive.css`
  - 优化移动端适配和响应式布局
  - 调整组件在不同屏幕尺寸下的表现

- [ ] **T041** 性能优化
  - 文件：多个组件文件
  - 实现组件懒加载和代码分割
  - 优化图片加载和缓存策略

## Phase 3.5: 测试完善和文档

- [ ] **T042** [P] 组件单元测试
  - 文件：`frontend/tests/unit/components/`
  - 为关键组件编写单元测试
  - 测试组件渲染和交互逻辑

- [ ] **T043** [P] 工具函数单元测试
  - 文件：`frontend/tests/unit/utils/`
  - 为工具函数编写单元测试
  - 测试数据验证和格式化函数

- [ ] **T044** E2E测试场景
  - 文件：`frontend/tests/e2e/`
  - 使用Cypress编写端到端测试
  - 覆盖主要用户流程

- [ ] **T045** [P] 性能测试
  - 文件：`frontend/tests/performance/`
  - 测试页面加载时间和交互响应
  - 验证性能指标 (<3秒加载, <200ms响应)

- [ ] **T046** [P] API文档更新
  - 文件：`docs/api.md`
  - 更新API接口文档
  - 添加使用示例和错误码说明

- [ ] **T047** 代码重构和优化
  - 文件：多个源文件
  - 移除重复代码和优化代码结构
  - 确保代码质量和可维护性

- [ ] **T048** 执行quickstart.md验证
  - 按照quickstart.md中的步骤验证项目
  - 确保所有功能正常工作
  - 验证部署和构建流程

## 任务依赖关系

### 关键依赖路径
1. **基础设置**: T001 → T002,T003,T004
2. **测试优先**: T005-T017 必须在所有实现任务前完成
3. **类型定义**: T018,T019,T020 → 状态管理和API服务
4. **状态管理**: T021,T022,T023 → UI组件
5. **API服务**: T024 → T025,T026,T027 → UI组件
6. **Mock数据**: T028,T029,T030 → T038
7. **UI组件**: T031,T032 → T033,T034,T035,T036 → T037
8. **集成**: T038,T039,T040,T041 → 测试完善

### 并行执行示例

```bash
# 阶段1: 项目设置 (可并行)
Task: "初始化前端项目 frontend/package.json"
Task: "初始化后端Mock服务 backend/package.json"
Task: "配置开发工具 .eslintrc.js, .prettierrc"

# 阶段2: 合约测试 (可并行)
Task: "用户注册API合约测试 frontend/tests/contract/auth-register.test.ts"
Task: "用户登录API合约测试 frontend/tests/contract/auth-login.test.ts"
Task: "商品列表API合约测试 frontend/tests/contract/products-list.test.ts"
Task: "购物车API合约测试 frontend/tests/contract/cart-get.test.ts"

# 阶段3: 类型定义 (可并行)
Task: "用户类型定义 frontend/src/types/user.ts"
Task: "商品类型定义 frontend/src/types/product.ts"
Task: "购物车类型定义 frontend/src/types/cart.ts"
```

## 验证检查清单

**实施前验证**:
- [ ] 所有合约测试已编写并失败
- [ ] 所有集成测试场景已定义
- [ ] 类型定义覆盖所有实体
- [ ] Mock数据结构与API合约一致

**实施后验证**:
- [ ] 所有测试通过
- [ ] API接口按合约正确实现
- [ ] UI组件符合设计要求
- [ ] 性能指标达到要求
- [ ] quickstart.md流程验证通过

## 注意事项

1. **TDD原则**: 必须先写测试，确保测试失败后再实现功能
2. **并行执行**: 标记[P]的任务可以同时进行，提高开发效率
3. **文件路径**: 每个任务都指定了确切的文件路径，避免冲突
4. **依赖管理**: 严格按照依赖关系执行，确保代码质量
5. **提交策略**: 每完成一个任务就提交代码，保持版本历史清晰

---

**任务总数**: 48个任务  
**预估工期**: 2-3周 (根据团队规模调整)  
**并行任务**: 25个任务可并行执行  
**关键路径**: 基础设置 → 测试 → 实现 → 集成 → 优化