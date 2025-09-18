import React from 'react';
import { useNavigate } from 'react-router-dom';
import BannerCarousel from '../components/BannerCarousel';
import CategoryNav from '../components/CategoryNav';
import ProductRecommendation from '../components/ProductRecommendation';
import UserPanel from '../components/UserPanel';

interface HomePageProps {
  isLoggedIn: boolean;
  username: string;
  onLogin: (username: string) => void;
  onLogout: () => void;
  onRegister: () => void;
}

const HomePage: React.FC<HomePageProps> = ({
  isLoggedIn,
  username,
  onLogin,
  onLogout,
  onRegister
}) => {
  const navigate = useNavigate();

  const handleProductClick = (product: any) => {
    navigate(`/product/${product.id}`);
  };
  // 模拟商品数据
  const mockProducts = [
    {
      id: 1,
      title: '苹果iPhone 15 Pro Max 256GB 深空黑色',
      price: 9999,
      originalPrice: 10999,
      image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=iPhone%2015%20Pro%20Max%20in%20deep%20space%20black%20color%2C%20product%20photography%2C%20clean%20white%20background%2C%20professional%20lighting&image_size=square',
      sales: 1234,
      rating: 4.9,
      shop: '苹果官方旗舰店'
    },
    {
      id: 2,
      title: '华为Mate 60 Pro 12GB+512GB 雅川青',
      price: 6999,
      originalPrice: 7999,
      image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Huawei%20Mate%2060%20Pro%20smartphone%20in%20elegant%20green%20color%2C%20product%20photography%2C%20clean%20white%20background%2C%20professional%20lighting&image_size=square',
      sales: 856,
      rating: 4.8,
      shop: '华为官方旗舰店'
    },
    {
      id: 3,
      title: '小米14 Ultra 16GB+1TB 钛金属黑',
      price: 5999,
      originalPrice: 6999,
      image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Xiaomi%2014%20Ultra%20smartphone%20in%20titanium%20black%20color%2C%20product%20photography%2C%20clean%20white%20background%2C%20professional%20lighting&image_size=square',
      sales: 2341,
      rating: 4.7,
      shop: '小米官方旗舰店'
    }
  ];

  return (
    <div className="bg-gray-50">
      <div className="tb-container">
        <div className="tb-content-wrapper">
          {/* 左侧分类导航 */}
          <div className="tb-left-sidebar">
            <CategoryNav />
          </div>
          
          {/* 中间内容区域 */}
          <div className="tb-center-content">
            {/* 轮播图 */}
            <BannerCarousel />
            
            {/* 商品推荐 */}
            <ProductRecommendation products={mockProducts} onProductClick={handleProductClick} />
          </div>
          
          {/* 右侧用户面板 */}
          <div className="tb-right-sidebar">
            <UserPanel 
              isLoggedIn={isLoggedIn}
              userName={username}
              onLogin={onLogin}
              onLogout={onLogout}
              onRegister={onRegister}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;