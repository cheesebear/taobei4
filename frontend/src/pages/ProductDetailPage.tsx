import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Share2, Star, Shield, Truck } from 'lucide-react';
import './ProductDetailPage.css';

interface Product {
  id: number;
  title: string;
  price: number;
  originalPrice: number;
  image: string;
  images: string[];
  sales: number;
  rating: number;
  shop: string;
  description: string;
  specifications: { [key: string]: string };
  reviews: {
    id: number;
    user: string;
    rating: number;
    comment: string;
    date: string;
  }[];
}

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    // 模拟获取商品详情数据
    const mockProduct: Product = {
      id: parseInt(id || '1'),
      title: '苹果iPhone 15 Pro Max 256GB 深空黑色 5G手机',
      price: 9999,
      originalPrice: 10999,
      image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=iPhone%2015%20Pro%20Max%20in%20deep%20space%20black%20color%2C%20product%20photography%2C%20clean%20white%20background%2C%20professional%20lighting&image_size=square',
      images: [
        'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=iPhone%2015%20Pro%20Max%20front%20view%2C%20deep%20space%20black%2C%20product%20photography&image_size=square',
        'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=iPhone%2015%20Pro%20Max%20back%20view%2C%20deep%20space%20black%2C%20product%20photography&image_size=square',
        'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=iPhone%2015%20Pro%20Max%20side%20view%2C%20deep%20space%20black%2C%20product%20photography&image_size=square',
        'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=iPhone%2015%20Pro%20Max%20camera%20detail%2C%20deep%20space%20black%2C%20product%20photography&image_size=square'
      ],
      sales: 1234,
      rating: 4.9,
      shop: '苹果官方旗舰店',
      description: 'iPhone 15 Pro Max 采用钛金属设计，搭载 A17 Pro 芯片，配备专业级摄像头系统，支持 5G 网络。',
      specifications: {
        '屏幕尺寸': '6.7英寸',
        '分辨率': '2796 x 1290像素',
        '处理器': 'A17 Pro芯片',
        '存储容量': '256GB',
        '摄像头': '4800万像素主摄',
        '电池容量': '4441mAh',
        '操作系统': 'iOS 17',
        '网络制式': '5G'
      },
      reviews: [
        {
          id: 1,
          user: '张***',
          rating: 5,
          comment: '手机很棒，拍照效果非常好，系统流畅。',
          date: '2024-01-15'
        },
        {
          id: 2,
          user: '李***',
          rating: 4,
          comment: '整体不错，就是价格有点贵。',
          date: '2024-01-10'
        }
      ]
    };
    setProduct(mockProduct);
  }, [id]);

  const handleAddToCart = () => {
    alert(`已添加 ${quantity} 件商品到购物车`);
  };

  const handleBuyNow = () => {
    alert('立即购买功能');
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <div className="product-container">
        {/* 面包屑导航 */}
        <nav className="breadcrumb-nav">
          <button onClick={() => navigate('/')} className="breadcrumb-link">
            首页
          </button>
          <span className="breadcrumb-separator">&gt;</span>
          <button onClick={() => navigate('/')} className="breadcrumb-link">
            手机数码
          </button>
          <span className="breadcrumb-separator">&gt;</span>
          <span className="breadcrumb-current">商品详情</span>
        </nav>

        {/* 店铺信息条 */}
        <div className="shop-info-bar">
          <div className="shop-info">
            <img src="https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=shop%20logo%20icon%2C%20simple%20design&image_size=square" alt="店铺" className="shop-avatar" />
            <div className="shop-details">
              <span className="shop-name">{product.shop}</span>
              <div className="shop-stats">
                <span className="shop-rating">4.6</span>
                <span className="shop-stat">90天新增77条好评</span>
                <span className="shop-stat">次日达超93%同行</span>
                <span className="shop-stat">平均20小时退款</span>
              </div>
            </div>
          </div>
          <div className="shop-actions">
            <button className="shop-contact">客服</button>
            <button className="shop-visit">进店</button>
          </div>
        </div>

        <div className="product-main-content">
          <div className="product-layout">
            {/* 商品图片 */}
            <div className="product-images">
              <div className="main-image">
                <img
                  src={product.images[selectedImage]}
                  alt={product.title}
                  className="main-image-img"
                />
              </div>
              <div className="thumbnail-list">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`thumbnail ${selectedImage === index ? 'thumbnail-active' : ''}`}
                  >
                    <img src={image} alt={`商品图片${index + 1}`} className="thumbnail-img" />
                  </button>
                ))}
              </div>
            </div>

            {/* 商品信息 */}
            <div className="product-info">
              <h1 className="product-title">{product.title}</h1>
              
              <div className="product-subtitle">
                超600人加购
              </div>

              <div className="price-section">
                <div className="price-main">
                  <span className="price-symbol">¥</span>
                  <span className="price-value">{product.price}</span>
                  <span className="price-unit">起</span>
                </div>
                <div className="price-original">
                  <span className="original-price">¥{product.originalPrice}</span>
                </div>
              </div>

              <div className="sales-info">
                <span className="sales-count">已售 {product.sales}</span>
                <div className="rating-info">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`rating-star ${
                        i < Math.floor(product.rating) ? 'rating-star-filled' : 'rating-star-empty'
                      }`}
                    />
                  ))}
                  <span className="rating-score">{product.rating}</span>
                </div>
              </div>

              <div className="delivery-info">
                <div className="delivery-item">
                  <span className="delivery-label">快递:</span>
                  <span className="delivery-value">免运费 上海 至 上海 崇明</span>
                </div>
                <div className="service-tags">
                  <span className="service-tag">7天无理由退货</span>
                  <span className="service-tag">信用卡支付</span>
                </div>
              </div>

              {/* 商品选项 */}
              <div className="product-options">
                <div className="option-group">
                  <label className="option-label">机身颜色</label>
                  <div className="option-values">
                    <button className="option-value option-value-active">
                      <img src="https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=silver%20color%20swatch&image_size=square" alt="银色" className="color-swatch" />
                      银色
                    </button>
                    <button className="option-value">
                      <img src="https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=orange%20color%20swatch&image_size=square" alt="星宇橙色" className="color-swatch" />
                      星宇橙色
                    </button>
                    <button className="option-value">
                      <img src="https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=blue%20color%20swatch&image_size=square" alt="深蓝色" className="color-swatch" />
                      深蓝色
                    </button>
                  </div>
                </div>

                <div className="option-group">
                  <label className="option-label">存储容量</label>
                  <div className="option-values">
                    <button className="option-value option-value-active">256GB</button>
                    <button className="option-value">512GB</button>
                    <button className="option-value">1TB</button>
                    <button className="option-value">2TB</button>
                  </div>
                </div>

                <div className="option-group">
                  <label className="option-label">网络类型</label>
                  <div className="option-values">
                    <button className="option-value option-value-active">5G全网通</button>
                  </div>
                </div>

                <div className="option-group">
                  <label className="option-label">套餐类型</label>
                  <div className="option-values">
                    <button className="option-value option-value-active">官方标配</button>
                  </div>
                </div>
              </div>

              <div className="quantity-section">
                <label className="quantity-label">数量</label>
                <div className="quantity-controls">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="quantity-btn quantity-btn-minus"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="quantity-input"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="quantity-btn quantity-btn-plus"
                  >
                    +
                  </button>
                </div>
                <span className="stock-status">即将售罄</span>
              </div>

              <div className="guarantee-section">
                <span className="guarantee-title">保障服务</span>
                <div className="guarantee-options">
                  <button className="guarantee-option">选购更多</button>
                </div>
              </div>

              <div className="action-buttons">
                <button
                  onClick={handleAddToCart}
                  className="btn-add-cart"
                >
                  <ShoppingCart className="btn-icon" />
                  加入购物车
                </button>
                <button
                  onClick={handleBuyNow}
                  className="btn-buy-now"
                >
                  立即购买
                </button>
              </div>

              <div className="secondary-actions">
                <button className="secondary-action">
                  <Heart className="action-icon" />
                  收藏
                </button>
                <div className="more-info">
                  <span>滑动右侧区域查看更多</span>
                </div>
              </div>
            </div>
          </div>

          {/* 商品详情标签页 */}
          <div className="product-tabs">
            <div className="tab-navigation">
              <nav className="tab-nav">
                <button
                  onClick={() => setActiveTab('gallery')}
                  className={`tab-button ${
                    activeTab === 'gallery' ? 'tab-button-active' : ''
                  }`}
                >
                  图集
                </button>
                <button
                  onClick={() => setActiveTab('specifications')}
                  className={`tab-button ${
                    activeTab === 'specifications' ? 'tab-button-active' : ''
                  }`}
                >
                  参数
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`tab-button ${
                    activeTab === 'reviews' ? 'tab-button-active' : ''
                  }`}
                >
                  用户评价
                </button>
                <button
                  onClick={() => setActiveTab('description')}
                  className={`tab-button ${
                    activeTab === 'description' ? 'tab-button-active' : ''
                  }`}
                >
                  图文详情
                </button>
              </nav>
            </div>

            <div className="tab-content">
              {activeTab === 'gallery' && (
                <div className="gallery-content">
                  <div className="gallery-grid">
                    {product.images.map((image, index) => (
                      <div key={index} className="gallery-item">
                        <img src={image} alt={`商品图片${index + 1}`} className="gallery-image" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'specifications' && (
                <div className="specifications-content">
                  <h3 className="spec-title">参数信息</h3>
                  <div className="spec-table">
                    <div className="spec-row">
                      <span className="spec-label">品牌</span>
                      <span className="spec-value">iPhone</span>
                    </div>
                    <div className="spec-row">
                      <span className="spec-label">CPU品牌</span>
                      <span className="spec-value">Apple/苹果</span>
                    </div>
                    <div className="spec-row">
                      <span className="spec-label">上市时间</span>
                      <span className="spec-value">2025-09</span>
                    </div>
                    <div className="spec-row">
                      <span className="spec-label">售后服务</span>
                      <span className="spec-value">全国联保</span>
                    </div>
                    <div className="spec-row">
                      <span className="spec-label">屏幕刷新率</span>
                      <span className="spec-value">120Hz</span>
                    </div>
                    <div className="spec-row">
                      <span className="spec-label">屏幕材质</span>
                      <span className="spec-value">OLED</span>
                    </div>
                    <div className="spec-row">
                      <span className="spec-label">版本类型</span>
                      <span className="spec-value">中国大陆</span>
                    </div>
                    <div className="spec-row">
                      <span className="spec-label">屏幕尺寸</span>
                      <span className="spec-value">6.86英寸</span>
                    </div>
                    <div className="spec-row">
                      <span className="spec-label">主摄像素</span>
                      <span className="spec-value">4800万</span>
                    </div>
                    <div className="spec-row">
                      <span className="spec-label">套餐类型</span>
                      <span className="spec-value">官方标配</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="reviews-content">
                  <div className="reviews-header">
                    <span className="reviews-title">用户评价 (0)</span>
                  </div>
                  <div className="no-reviews">
                    <p>暂时还没有评价呢~</p>
                  </div>
                </div>
              )}

              {activeTab === 'description' && (
                <div className="description-content">
                  <h3 className="description-title">图文详情</h3>
                  <div className="description-images">
                    {/* 商品详情图片 */}
                    <img src="https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=iPhone%20product%20detail%20banner%2C%20professional%20product%20photography&image_size=landscape" alt="商品详情" className="detail-image" />
                    <img src="https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=iPhone%20features%20showcase%2C%20technical%20specifications&image_size=landscape" alt="功能展示" className="detail-image" />
                    <img src="https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=iPhone%20camera%20system%20details%2C%20photography%20examples&image_size=landscape" alt="摄像头系统" className="detail-image" />
                  </div>
                  <div className="charity-info">
                    <p>公益宝贝 每笔成交将为 农村儿童成长支持计划 捐赠 0.1元 。</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;