const jsonServer = require('json-server');
const cors = require('cors');
const path = require('path');

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'data/db.json'));
const middlewares = jsonServer.defaults();

// 配置CORS
server.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

// 使用默认中间件
server.use(middlewares);

// 添加自定义路由
server.use(jsonServer.bodyParser);

// 用户注册路由
server.post('/api/auth/register', (req, res) => {
  const { phone, password, verificationCode } = req.body;
  
  // 简单验证
  if (!phone || !password || !verificationCode) {
    return res.status(400).json({
      code: 400,
      message: '手机号、密码和验证码不能为空'
    });
  }
  
  // 检查手机号是否已注册
  const db = router.db;
  const existingUser = db.get('users').find({ phone }).value();
  
  if (existingUser) {
    return res.status(409).json({
      code: 409,
      message: '手机号已注册'
    });
  }
  
  // 创建新用户
  const newUser = {
    id: Date.now(),
    phone,
    password: `$2b$10$${password}`, // 模拟加密
    nickname: `用户${phone.slice(-4)}`,
    avatar: 'https://via.placeholder.com/100',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  db.get('users').push(newUser).write();
  
  res.status(201).json({
    code: 201,
    message: '注册成功',
    data: {
      id: newUser.id,
      phone: newUser.phone,
      nickname: newUser.nickname,
      avatar: newUser.avatar
    }
  });
});

// 用户登录路由
server.post('/api/auth/login', (req, res) => {
  const { phone, password } = req.body;
  
  if (!phone || !password) {
    return res.status(400).json({
      code: 400,
      message: '手机号和密码不能为空'
    });
  }
  
  const db = router.db;
  const user = db.get('users').find({ phone }).value();
  
  if (!user) {
    return res.status(401).json({
      code: 401,
      message: '用户不存在'
    });
  }
  
  // 简单密码验证（实际应用中应该使用bcrypt）
  if (!user.password.includes(password)) {
    return res.status(401).json({
      code: 401,
      message: '密码错误'
    });
  }
  
  res.json({
    code: 200,
    message: '登录成功',
    data: {
      user: {
        id: user.id,
        phone: user.phone,
        nickname: user.nickname,
        avatar: user.avatar,
        name: user.nickname,
        email: user.phone,
        isActive: true
      },
      token: `mock_token_${user.id}_${Date.now()}`
    }
  });
});

// 发送验证码路由
server.post('/api/auth/send-code', (req, res) => {
  const { phone } = req.body;
  
  if (!phone) {
    return res.status(400).json({
      code: 400,
      message: '手机号不能为空'
    });
  }
  
  // 模拟发送验证码
  console.log(`发送验证码到 ${phone}: 123456`);
  
  res.json({
    code: 200,
    message: '验证码发送成功',
    data: {
      code: '123456' // 仅用于开发测试
    }
  });
});

// 验证验证码路由
server.post('/api/auth/verify-code', (req, res) => {
  const { phone, code } = req.body;
  
  if (!phone || !code) {
    return res.status(400).json({
      code: 400,
      message: '手机号和验证码不能为空'
    });
  }
  
  // 模拟验证码验证（开发环境固定为123456）
  if (code === '123456') {
    res.json({
      code: 200,
      message: '验证码验证成功'
    });
  } else {
    res.status(400).json({
      code: 400,
      message: '验证码错误'
    });
  }
});

// 检查手机号是否已注册
server.post('/api/auth/check-phone', (req, res) => {
  const { phone } = req.body;
  
  if (!phone) {
    return res.status(400).json({
      code: 400,
      message: '手机号不能为空'
    });
  }
  
  const db = router.db;
  const existingUser = db.get('users').find({ phone }).value();
  
  res.json({
    code: 200,
    data: {
      exists: !!existingUser
    }
  });
});

// 用户登出路由
server.post('/api/auth/logout', (req, res) => {
  res.json({
    code: 200,
    message: '登出成功'
  });
});

// 健康检查路由
server.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// 获取用户资料
server.get('/api/user/profile', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      code: 401,
      message: '未授权访问'
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  // 简单的token验证（实际应用中应该使用JWT验证）
  if (!token.startsWith('mock_token_')) {
    return res.status(401).json({
      code: 401,
      message: 'Token无效'
    });
  }
  
  // 从token中提取用户ID
  const userId = parseInt(token.split('_')[2]);
  
  const db = router.db;
  const user = db.get('users').find({ id: userId }).value();
  
  if (!user) {
    return res.status(404).json({
      code: 404,
      message: '用户不存在'
    });
  }
  
  res.json({
    code: 200,
    data: {
      user: {
        id: user.id,
        phone: user.phone,
        nickname: user.nickname,
        avatar: user.avatar,
        name: user.nickname,
        email: user.phone,
        isActive: true
      }
    }
  });
});

// 更新用户资料
server.put('/api/user/profile', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      code: 401,
      message: '未授权访问'
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  // 简单的token验证
  if (!token.startsWith('mock_token_')) {
    return res.status(401).json({
      code: 401,
      message: 'Token无效'
    });
  }
  
  // 从token中提取用户ID
  const userId = parseInt(token.split('_')[2]);
  
  const db = router.db;
  const user = db.get('users').find({ id: userId }).value();
  
  if (!user) {
    return res.status(404).json({
      code: 404,
      message: '用户不存在'
    });
  }
  
  const { name, nickname, avatar } = req.body;
  
  // 更新用户信息
  const updatedUser = {
    ...user,
    nickname: nickname || name || user.nickname,
    avatar: avatar || user.avatar,
    updatedAt: new Date().toISOString()
  };
  
  db.get('users')
    .find({ id: userId })
    .assign(updatedUser)
    .write();
  
  res.json({
    code: 200,
    message: '用户资料更新成功',
    data: {
      user: {
        id: updatedUser.id,
        phone: updatedUser.phone,
        nickname: updatedUser.nickname,
        avatar: updatedUser.avatar,
        name: updatedUser.nickname,
        email: updatedUser.phone,
        isActive: true
      }
    }
  });
});

// 修改密码
server.put('/api/user/change-password', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      code: 401,
      message: '未授权访问'
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  if (!token.startsWith('mock_token_')) {
    return res.status(401).json({
      code: 401,
      message: 'Token无效'
    });
  }
  
  const userId = parseInt(token.split('_')[2]);
  const { currentPassword, newPassword, confirmPassword } = req.body;
  
  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({
      code: 400,
      message: '当前密码、新密码和确认密码不能为空'
    });
  }
  
  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      code: 400,
      message: '新密码和确认密码不匹配'
    });
  }
  
  const db = router.db;
  const user = db.get('users').find({ id: userId }).value();
  
  if (!user) {
    return res.status(404).json({
      code: 404,
      message: '用户不存在'
    });
  }
  
  // 验证当前密码
  if (!user.password.includes(currentPassword)) {
    return res.status(400).json({
      code: 400,
      message: '当前密码错误'
    });
  }
  
  // 更新密码
  db.get('users')
    .find({ id: userId })
    .assign({ 
      password: `$2b$10$${newPassword}`,
      updatedAt: new Date().toISOString()
    })
    .write();
  
  res.json({
    code: 200,
    message: '密码修改成功'
  });
});

// 商品列表路由
server.get('/api/products', (req, res) => {
  const { page = 1, limit = 20, category, brand, minPrice, maxPrice, minRating, inStock, tags, sortBy, sortOrder, keyword } = req.query;
  const db = router.db;
  let products = db.get('products').value();

  // 关键词搜索
  if (keyword) {
    products = products.filter(p => 
      p.title.toLowerCase().includes(keyword.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(keyword.toLowerCase()))
    );
  }

  // 验证价格区间
  if (minPrice && maxPrice && parseFloat(minPrice) > parseFloat(maxPrice)) {
    return res.status(400).json({
      code: 400,
      success: false,
      message: '最低价格不能大于最高价格，请检查价格区间设置'
    });
  }

  // 筛选逻辑
  if (category) {
    products = products.filter(p => p.category === category);
  }
  
  if (brand) {
    products = products.filter(p => p.brand === brand);
  }
  
  if (minPrice) {
    products = products.filter(p => p.price >= parseFloat(minPrice));
  }
  
  if (maxPrice) {
    products = products.filter(p => p.price <= parseFloat(maxPrice));
  }
  
  if (minRating) {
    const rating = parseFloat(minRating);
    if (isNaN(rating) || rating < 0 || rating > 5 || rating % 1 !== 0) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: '评分必须是0-5之间的整数'
      });
    }
    products = products.filter(p => p.rating >= rating);
  }
  
  if (inStock === 'true') {
    products = products.filter(p => p.stock > 0);
  }
  
  // 标签筛选
  if (tags) {
    const tagList = Array.isArray(tags) ? tags : [tags];
    products = products.filter(p => {
      if (!p.tags || !Array.isArray(p.tags)) return false;
      return tagList.some(tag => p.tags.includes(tag));
    });
  }
  
  // 验证排序参数
  const validSortFields = ['price', 'rating', 'sales', 'createdAt', 'title'];
  if (sortBy && !validSortFields.includes(sortBy)) {
    return res.status(400).json({
      code: 400,
      success: false,
      message: '无效的排序字段，支持的字段：' + validSortFields.join(', ')
    });
  }

  const validSortOrders = ['asc', 'desc'];
  if (sortOrder && !validSortOrders.includes(sortOrder)) {
    return res.status(400).json({
      code: 400,
      success: false,
      message: '无效的排序方向，支持：asc（升序）、desc（降序）'
    });
  }

  // 排序逻辑
  if (sortBy) {
    products.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      const order = sortOrder || 'asc';
      if (order === 'desc') {
        return bValue > aValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });
  }
  
  // 分页
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  
  // 验证分页参数
  if (pageNum <= 0 || isNaN(pageNum)) {
    return res.status(400).json({
      code: 400,
      message: '页码必须是大于0的整数'
    });
  }
  
  if (limitNum <= 0 || limitNum > 100 || isNaN(limitNum)) {
    return res.status(400).json({
      code: 400,
      message: '每页数量必须是1-100之间的整数'
    });
  }
  
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;
  const paginatedProducts = products.slice(startIndex, endIndex);
  
  // 格式化商品数据
  const formattedProducts = paginatedProducts.map(product => ({
    id: product.id.toString(),
    title: product.title,
    price: product.price,
    originalPrice: product.originalPrice || product.price,
    image: product.image,
    images: product.images || [product.image],
    category: product.category,
    brand: product.brand || 'Unknown',
    rating: product.rating || 0,
    reviewCount: product.reviewCount || 0,
    sales: product.sales || 0,
    stock: product.stock || 0,
    tags: product.tags || [],
    createdAt: product.createdAt || new Date().toISOString(),
    updatedAt: product.updatedAt || new Date().toISOString()
  }));
  
  const totalPages = Math.ceil(products.length / limitNum);
  
  // 设置缓存相关的响应头
  res.set({
    'cache-control': 'public, max-age=300',
    'etag': `"${Date.now()}-${products.length}"`
  });
  
  res.json({
    code: 200,
    data: {
      data: {
        products: formattedProducts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: products.length,
          totalPages: totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1
        },
        filters: {
          category,
          brand,
          minPrice,
          maxPrice,
          minRating,
          inStock,
          tags
        },
        sorting: {
          sortBy,
          sortOrder: sortOrder || 'asc'
        }
      }
    }
  });
});

// 商品搜索路由
server.get('/api/products/search', (req, res) => {
  const { q, category, minPrice, maxPrice, page = 1, limit = 20 } = req.query;
  const db = router.db;
  let products = db.get('products').value();
  
  // 搜索过滤
  if (q) {
    products = products.filter(p => 
      p.title.toLowerCase().includes(q.toLowerCase()) ||
      p.description.toLowerCase().includes(q.toLowerCase())
    );
  }
  
  if (category) {
    products = products.filter(p => p.category === category);
  }
  
  if (minPrice) {
    products = products.filter(p => p.price >= parseFloat(minPrice));
  }
  
  if (maxPrice) {
    products = products.filter(p => p.price <= parseFloat(maxPrice));
  }
  
  // 分页
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedProducts = products.slice(startIndex, endIndex);
  
  res.json({
    code: 200,
    data: {
      data: {
        products: paginatedProducts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: products.length,
          totalPages: Math.ceil(products.length / limit)
        }
      }
    }
  });
});

// 店铺相关路由
server.get('/api/shops', (req, res) => {
  res.json(db.shops);
});

server.get('/api/shops/:id', (req, res) => {
  const shop = db.shops.find(s => s.id === parseInt(req.params.id));
  if (!shop) {
    return res.status(404).json({ error: '店铺不存在' });
  }
  res.json(shop);
});

server.get('/api/shops/:id/products', (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const shopId = parseInt(req.params.id);
  
  const shop = db.shops.find(s => s.id === shopId);
  if (!shop) {
    return res.status(404).json({ error: '店铺不存在' });
  }

  let products = db.products.filter(p => p.shopId === shopId);
  
  // 分页
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedProducts = products.slice(startIndex, endIndex);

  res.json({
    products: paginatedProducts,
    total: products.length,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(products.length / limit)
  });
});

// 分类相关路由
server.get('/api/categories', (req, res) => {
  res.json(db.categories);
});

server.get('/api/categories/:id/products', (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const categoryId = parseInt(req.params.id);
  
  const category = db.categories.find(c => c.id === categoryId);
  if (!category) {
    return res.status(404).json({ error: '分类不存在' });
  }

  let products = db.products.filter(p => p.categoryId === categoryId);
  
  // 分页
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedProducts = products.slice(startIndex, endIndex);

  res.json({
    products: paginatedProducts,
    total: products.length,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(products.length / limit)
  });
});

// 购物车相关路由
server.get('/api/cart', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      code: 401,
      message: '未授权访问'
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  // 简单的token验证
  if (!token.startsWith('mock_token_')) {
    return res.status(401).json({
      code: 401,
      message: 'Token无效'
    });
  }
  
  // 从token中提取用户ID
  const userId = parseInt(token.split('_')[2]);
  
  if (!userId) {
    return res.status(400).json({
      code: 400,
      message: '用户ID不能为空'
    });
  }
  
  const db = router.db;
  const cartItems = db.get('cart').filter({ userId: parseInt(userId) }).value();
  
  // 计算购物车汇总信息
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalPrice = subtotal; // 简化版，不考虑优惠
  
  const cart = {
    userId: parseInt(userId),
    items: cartItems.map(item => ({
      id: item.id,
      productId: item.productId,
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      subtotal: item.price * item.quantity,
      createdAt: item.createdAt,
      product: {
        id: item.productId,
        name: item.title,
        price: item.price,
        image: item.image,
        stock: 100, // 模拟库存
        category: 'electronics' // 模拟分类
      },
      isAvailable: true,
      stockStatus: 'in_stock',
      priceChanged: false
    })),
    summary: {
      totalItems,
      subtotal,
      totalPrice,
      discount: 0,
      shipping: 0
    },
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  res.json({
    code: 200,
    data: {
      data: {
        cart
      }
    }
  });
});

server.post('/api/cart/add', (req, res) => {
  const { userId, productId, quantity = 1 } = req.body;
  
  if (!userId || !productId) {
    return res.status(400).json({
      code: 400,
      message: '用户ID和商品ID不能为空'
    });
  }
  
  const db = router.db;
  const product = db.get('products').find({ id: parseInt(productId) }).value();
  
  if (!product) {
    return res.status(404).json({
      code: 404,
      message: '商品不存在'
    });
  }
  
  // 检查购物车中是否已有该商品
  const existingItem = db.get('cart').find({ 
    userId: parseInt(userId), 
    productId: parseInt(productId) 
  }).value();
  
  if (existingItem) {
    // 更新数量
    db.get('cart')
      .find({ userId: parseInt(userId), productId: parseInt(productId) })
      .assign({ quantity: existingItem.quantity + quantity })
      .write();
  } else {
    // 添加新商品
    const cartItem = {
      id: Date.now(),
      userId: parseInt(userId),
      productId: parseInt(productId),
      title: product.title,
      price: product.price,
      image: product.image,
      quantity: quantity,
      createdAt: new Date().toISOString()
    };
    
    db.get('cart').push(cartItem).write();
  }
  
  res.json({
    code: 200,
    message: '添加到购物车成功'
  });
});

server.put('/api/cart/update', (req, res) => {
  const { userId, productId, quantity } = req.body;
  
  if (!userId || !productId || quantity === undefined) {
    return res.status(400).json({
      code: 400,
      message: '用户ID、商品ID和数量不能为空'
    });
  }
  
  const db = router.db;
  const cartItem = db.get('cart').find({ 
    userId: parseInt(userId), 
    productId: parseInt(productId) 
  }).value();
  
  if (!cartItem) {
    return res.status(404).json({
      code: 404,
      message: '购物车中没有该商品'
    });
  }
  
  if (quantity <= 0) {
    // 删除商品
    db.get('cart').remove({ 
      userId: parseInt(userId), 
      productId: parseInt(productId) 
    }).write();
  } else {
    // 更新数量
    db.get('cart')
      .find({ userId: parseInt(userId), productId: parseInt(productId) })
      .assign({ quantity: quantity })
      .write();
  }
  
  res.json({
    code: 200,
    message: '购物车更新成功'
  });
});

server.delete('/api/cart/remove', (req, res) => {
  const { userId, productId } = req.body;
  
  if (!userId || !productId) {
    return res.status(400).json({
      code: 400,
      message: '用户ID和商品ID不能为空'
    });
  }
  
  const db = router.db;
  db.get('cart').remove({ 
    userId: parseInt(userId), 
    productId: parseInt(productId) 
  }).write();
  
  res.json({
    code: 200,
    message: '从购物车删除成功'
  });
});

server.delete('/api/cart/clear', (req, res) => {
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({
      code: 400,
      message: '用户ID不能为空'
    });
  }
  
  const db = router.db;
  db.get('cart').remove({ userId: parseInt(userId) }).write();
  
  res.json({
    code: 200,
    message: '购物车清空成功'
  });
});



// 使用默认路由器
server.use('/api', router);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`JSON Server is running on port ${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
});