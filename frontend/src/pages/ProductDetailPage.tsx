import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Share2, Star, Shield, Truck } from 'lucide-react';
import TaobaoHeader from '../components/TaobaoHeader';
import TaobaoFooter from '../components/TaobaoFooter';

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
    <div className="min-h-screen bg-gray-50">
      <TaobaoHeader />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 面包屑导航 */}
        <nav className="text-sm text-gray-500 mb-6">
          <button onClick={() => navigate('/')} className="hover:text-orange-500">
            首页
          </button>
          <span className="mx-2">&gt;</span>
          <button onClick={() => navigate('/')} className="hover:text-orange-500">
            手机数码
          </button>
          <span className="mx-2">&gt;</span>
          <span className="text-gray-800">商品详情</span>
        </nav>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 商品图片 */}
            <div>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                <img
                  src={product.images[selectedImage]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                      selectedImage === index ? 'border-orange-500' : 'border-gray-200'
                    }`}
                  >
                    <img src={image} alt={`商品图片${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* 商品信息 */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{product.title}</h1>
              
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">{product.rating}</span>
                </div>
                <span className="ml-4 text-sm text-gray-600">已售 {product.sales} 件</span>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-red-600">¥{product.price}</span>
                  <span className="ml-2 text-lg text-gray-500 line-through">¥{product.originalPrice}</span>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Shield className="w-4 h-4 mr-2" />
                  <span>正品保障</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Truck className="w-4 h-4 mr-2" />
                  <span>免费配送</span>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">数量</label>
                <div className="flex items-center">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 border border-gray-300 rounded-l-md hover:bg-gray-50"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 px-3 py-1 border-t border-b border-gray-300 text-center"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1 border border-gray-300 rounded-r-md hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex space-x-4 mb-6">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-orange-100 text-orange-600 py-3 px-6 rounded-lg font-medium hover:bg-orange-200 transition-colors flex items-center justify-center"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  加入购物车
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 bg-orange-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                >
                  立即购买
                </button>
              </div>

              <div className="flex space-x-4">
                <button className="flex items-center text-gray-600 hover:text-red-500">
                  <Heart className="w-5 h-5 mr-1" />
                  收藏
                </button>
                <button className="flex items-center text-gray-600 hover:text-blue-500">
                  <Share2 className="w-5 h-5 mr-1" />
                  分享
                </button>
              </div>
            </div>
          </div>

          {/* 商品详情标签页 */}
          <div className="mt-12">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('description')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'description'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  商品详情
                </button>
                <button
                  onClick={() => setActiveTab('specifications')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'specifications'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  规格参数
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'reviews'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  用户评价
                </button>
              </nav>
            </div>

            <div className="py-6">
              {activeTab === 'description' && (
                <div>
                  <p className="text-gray-700 leading-relaxed">{product.description}</p>
                </div>
              )}

              {activeTab === 'specifications' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-700">{key}</span>
                      <span className="text-gray-600">{value}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {product.reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-4">
                      <div className="flex items-center mb-2">
                        <span className="font-medium text-gray-900">{review.user}</span>
                        <div className="flex items-center ml-4">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="ml-4 text-sm text-gray-500">{review.date}</span>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <TaobaoFooter />
    </div>
  );
};

export default ProductDetailPage;