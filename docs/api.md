# 淘贝电商平台 API 文档

## API 概述

淘贝电商平台提供了完整的RESTful API，支持用户认证、商品管理、购物车操作等核心功能。

- **基础URL**: `http://localhost:3001/api`
- **数据格式**: JSON
- **字符编码**: UTF-8
- **认证方式**: Bearer Token

### 通用响应格式

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {}
}
```

### 错误响应格式

```json
{
  "code": 400,
  "message": "错误描述"
}
```

## 认证相关API

### 1. 用户注册

**请求方法**: `POST`  
**请求URL**: `/api/auth/register`  
**请求头**: `Content-Type: application/json`

**请求参数**:
```json
{
  "phone": "13800138000",
  "password": "123456",
  "verificationCode": "123456"
}
```

**响应示例**:
```json
{
  "code": 201,
  "message": "注册成功",
  "data": {
    "id": 1234567890,
    "phone": "13800138000",
    "nickname": "用户8000",
    "avatar": "https://via.placeholder.com/100"
  }
}
```

### 2. 用户登录

**请求方法**: `POST`  
**请求URL**: `/api/auth/login`  
**请求头**: `Content-Type: application/json`

**请求参数**:
```json
{
  "phone": "13800138000",
  "password": "123456"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "user": {
      "id": 1234567890,
      "phone": "13800138000",
      "nickname": "用户8000",
      "avatar": "https://via.placeholder.com/100",
      "name": "用户8000",
      "email": "13800138000",
      "isActive": true
    },
    "token": "mock_token_1234567890_1234567890"
  }
}
```

### 3. 发送验证码

**请求方法**: `POST`  
**请求URL**: `/api/auth/send-code`  
**请求头**: `Content-Type: application/json`

**请求参数**:
```json
{
  "phone": "13800138000"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "验证码发送成功",
  "data": {
    "code": "123456"
  }
}
```

### 4. 验证验证码

**请求方法**: `POST`  
**请求URL**: `/api/auth/verify-code`  
**请求头**: `Content-Type: application/json`

**请求参数**:
```json
{
  "phone": "13800138000",
  "code": "123456"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "验证码验证成功"
}
```

### 5. 检查手机号是否已注册

**请求方法**: `POST`  
**请求URL**: `/api/auth/check-phone`  
**请求头**: `Content-Type: application/json`

**请求参数**:
```json
{
  "phone": "13800138000"
}
```

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "exists": true
  }
}
```

### 6. 用户登出

**请求方法**: `POST`  
**请求URL**: `/api/auth/logout`  
**请求头**: `Authorization: Bearer {token}`

**响应示例**:
```json
{
  "code": 200,
  "message": "登出成功"
}
```

## 用户相关API

### 1. 获取用户资料

**请求方法**: `GET`  
**请求URL**: `/api/user/profile`  
**请求头**: `Authorization: Bearer {token}`

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "user": {
      "id": 1234567890,
      "phone": "13800138000",
      "nickname": "用户8000",
      "avatar": "https://via.placeholder.com/100",
      "name": "用户8000",
      "email": "13800138000",
      "isActive": true
    }
  }
}
```

### 2. 更新用户资料

**请求方法**: `PUT`  
**请求URL**: `/api/user/profile`  
**请求头**: 
- `Authorization: Bearer {token}`
- `Content-Type: application/json`

**请求参数**:
```json
{
  "name": "新昵称",
  "nickname": "新昵称",
  "avatar": "https://example.com/avatar.jpg"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "用户资料更新成功",
  "data": {
    "user": {
      "id": 1234567890,
      "phone": "13800138000",
      "nickname": "新昵称",
      "avatar": "https://example.com/avatar.jpg",
      "name": "新昵称",
      "email": "13800138000",
      "isActive": true
    }
  }
}
```

### 3. 修改密码

**请求方法**: `PUT`  
**请求URL**: `/api/user/change-password`  
**请求头**: 
- `Authorization: Bearer {token}`
- `Content-Type: application/json`

**请求参数**:
```json
{
  "currentPassword": "123456",
  "newPassword": "654321",
  "confirmPassword": "654321"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "密码修改成功"
}
```

## 商品相关API

### 1. 获取商品列表

**请求方法**: `GET`  
**请求URL**: `/api/products`  

**查询参数**:
- `page`: 页码（默认：1）
- `limit`: 每页数量（默认：20，最大：100）
- `category`: 商品分类
- `brand`: 品牌
- `minPrice`: 最低价格
- `maxPrice`: 最高价格
- `minRating`: 最低评分（0-5整数）
- `inStock`: 是否有库存（true/false）
- `tags`: 标签（可多个）
- `sortBy`: 排序字段（price/rating/sales/createdAt/title）
- `sortOrder`: 排序方向（asc/desc）
- `keyword`: 搜索关键词

**请求示例**:
```
GET /api/products?page=1&limit=10&category=electronics&minPrice=100&maxPrice=1000&sortBy=price&sortOrder=asc
```

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "data": {
      "products": [
        {
          "id": "1",
          "title": "iPhone 15 Pro",
          "price": 7999,
          "originalPrice": 8999,
          "image": "https://example.com/iphone.jpg",
          "images": ["https://example.com/iphone1.jpg"],
          "category": "electronics",
          "brand": "Apple",
          "rating": 5,
          "reviewCount": 1000,
          "sales": 5000,
          "stock": 100,
          "tags": ["热销", "新品"],
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": "2024-01-01T00:00:00.000Z"
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 100,
        "totalPages": 10,
        "hasNext": true,
        "hasPrev": false
      },
      "filters": {
        "category": "electronics",
        "minPrice": "100",
        "maxPrice": "1000"
      },
      "sorting": {
        "sortBy": "price",
        "sortOrder": "asc"
      }
    }
  }
}
```

### 2. 商品搜索

**请求方法**: `GET`  
**请求URL**: `/api/products/search`  

**查询参数**:
- `q`: 搜索关键词
- `category`: 商品分类
- `minPrice`: 最低价格
- `maxPrice`: 最高价格
- `page`: 页码（默认：1）
- `limit`: 每页数量（默认：20）

**请求示例**:
```
GET /api/products/search?q=iPhone&category=electronics&page=1&limit=10
```

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "data": {
      "products": [
        {
          "id": 1,
          "title": "iPhone 15 Pro",
          "price": 7999,
          "image": "https://example.com/iphone.jpg",
          "category": "electronics",
          "brand": "Apple"
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 5,
        "totalPages": 1
      }
    }
  }
}
```

### 3. 获取商品详情

**请求方法**: `GET`  
**请求URL**: `/api/products/{id}`  

**路径参数**:
- `id`: 商品ID

**响应示例**:
```json
{
  "id": 1,
  "title": "iPhone 15 Pro",
  "description": "最新款iPhone，性能强劲",
  "price": 7999,
  "originalPrice": 8999,
  "image": "https://example.com/iphone.jpg",
  "images": ["https://example.com/iphone1.jpg"],
  "category": "electronics",
  "brand": "Apple",
  "rating": 5,
  "reviewCount": 1000,
  "sales": 5000,
  "stock": 100,
  "tags": ["热销", "新品"]
}
```

## 购物车相关API

### 1. 获取购物车

**请求方法**: `GET`  
**请求URL**: `/api/cart`  
**请求头**: `Authorization: Bearer {token}`

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "data": {
      "cart": {
        "userId": 1234567890,
        "items": [
          {
            "id": 1,
            "productId": 1,
            "title": "iPhone 15 Pro",
            "price": 7999,
            "quantity": 2,
            "image": "https://example.com/iphone.jpg",
            "subtotal": 15998,
            "createdAt": "2024-01-01T00:00:00.000Z",
            "product": {
              "id": 1,
              "name": "iPhone 15 Pro",
              "price": 7999,
              "image": "https://example.com/iphone.jpg",
              "stock": 100,
              "category": "electronics"
            },
            "isAvailable": true,
            "stockStatus": "in_stock",
            "priceChanged": false
          }
        ],
        "summary": {
          "totalItems": 2,
          "subtotal": 15998,
          "totalPrice": 15998,
          "discount": 0,
          "shipping": 0
        },
        "status": "active",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    }
  }
}
```

### 2. 添加商品到购物车

**请求方法**: `POST`  
**请求URL**: `/api/cart/add`  
**请求头**: `Content-Type: application/json`

**请求参数**:
```json
{
  "userId": 1234567890,
  "productId": 1,
  "quantity": 2
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "添加到购物车成功"
}
```

### 3. 更新购物车商品数量

**请求方法**: `PUT`  
**请求URL**: `/api/cart/update`  
**请求头**: `Content-Type: application/json`

**请求参数**:
```json
{
  "userId": 1234567890,
  "productId": 1,
  "quantity": 3
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "购物车更新成功"
}
```

### 4. 从购物车删除商品

**请求方法**: `DELETE`  
**请求URL**: `/api/cart/remove`  
**请求头**: `Content-Type: application/json`

**请求参数**:
```json
{
  "userId": 1234567890,
  "productId": 1
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "从购物车删除成功"
}
```

### 5. 清空购物车

**请求方法**: `DELETE`  
**请求URL**: `/api/cart/clear`  
**请求头**: `Content-Type: application/json`

**请求参数**:
```json
{
  "userId": 1234567890
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "购物车清空成功"
}
```

## 其他API

### 1. 健康检查

**请求方法**: `GET`  
**请求URL**: `/health`  

**响应示例**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. 获取店铺列表

**请求方法**: `GET`  
**请求URL**: `/api/shops`  

### 3. 获取店铺详情

**请求方法**: `GET`  
**请求URL**: `/api/shops/{id}`  

### 4. 获取店铺商品

**请求方法**: `GET`  
**请求URL**: `/api/shops/{id}/products`  

### 5. 获取分类列表

**请求方法**: `GET`  
**请求URL**: `/api/categories`  

### 6. 获取分类商品

**请求方法**: `GET`  
**请求URL**: `/api/categories/{id}/products`  

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权访问 |
| 404 | 资源不存在 |
| 409 | 资源冲突 |
| 500 | 服务器内部错误 |

## 注意事项

1. 所有需要认证的API都需要在请求头中携带有效的Bearer Token
2. 验证码在开发环境中固定为 `123456`
3. 分页参数中，页码从1开始，每页最大数量为100
4. 价格单位为分（整数）
5. 时间格式统一使用ISO 8601标准
6. 所有API都支持CORS跨域请求