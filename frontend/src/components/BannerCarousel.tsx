import React, { useState, useEffect, useCallback, useMemo } from 'react';

interface BannerCarouselProps {
  autoPlay?: boolean;
  interval?: number;
}

const BannerCarousel: React.FC<BannerCarouselProps> = React.memo(({ 
  autoPlay = true, 
  interval = 3000 
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // 轮播图数据
  const banners = useMemo(() => [
    {
      id: 1,
      image: 'https://img.alicdn.com/imgextra/i1/6000000007738/O1CN01K8Z9QY1yzJ8Z9QY1y_!!6000000007738-0-tps-520-280.jpg',
      title: '双11全球狂欢节',
      link: '#'
    },
    {
      id: 2,
      image: 'https://img.alicdn.com/imgextra/i2/6000000007738/O1CN01L9A0XZ1yzJ8a0XZ1z_!!6000000007738-0-tps-520-280.jpg',
      title: '天猫超市',
      link: '#'
    },
    {
      id: 3,
      image: 'https://img.alicdn.com/imgextra/i3/6000000007738/O1CN01M0B1YA1yzJ8b1YA20_!!6000000007738-0-tps-520-280.jpg',
      title: '聚划算',
      link: '#'
    },
    {
      id: 4,
      image: 'https://img.alicdn.com/imgextra/i4/6000000007738/O1CN01N1C2ZB1yzJ8c2ZB31_!!6000000007738-0-tps-520-280.jpg',
      title: '淘宝直播',
      link: '#'
    },
    {
      id: 5,
      image: 'https://img.alicdn.com/imgextra/i1/6000000007738/O1CN01O2D3AC1yzJ8d3AC42_!!6000000007738-0-tps-520-280.jpg',
      title: '品牌特卖',
      link: '#'
    }
  ], []);

  // 快捷入口数据
  const quickLinks = useMemo(() => [
    { name: '充值中心', icon: '💳' },
    { name: '淘票票', icon: '🎬' },
    { name: '飞猪旅行', icon: '✈️' },
    { name: '淘宝吃货', icon: '🍔' }
  ], []);

  // 自动轮播
  useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, banners.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    // 创建一个简单的占位图
    const canvas = document.createElement('canvas');
    canvas.width = 520;
    canvas.height = 280;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // 渐变背景
      const gradient = ctx.createLinearGradient(0, 0, 520, 280);
      gradient.addColorStop(0, '#ff6600');
      gradient.addColorStop(1, '#ff9900');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 520, 280);
      
      // 添加文字
      ctx.fillStyle = 'white';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('淘宝网', 260, 140);
      ctx.font = '18px Arial';
      ctx.fillText('精彩购物体验', 260, 180);
    }
    target.src = canvas.toDataURL();
  }, []);

  return (
    <>
      {/* 轮播区域 */}
      <div className="tb-banner-carousel">
        <div className="tb-banner-container">
          <div className="tb-banner-slide">
            <img 
              src={banners[currentSlide].image}
              alt={banners[currentSlide].title}
              onError={handleImageError}
            />
          </div>
        </div>
        
        {/* 轮播指示器 */}
        <div className="tb-banner-dots">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`tb-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* 快捷入口 */}
      <div className="tb-quick-links">
        {quickLinks.map((link, index) => (
          <div key={index} className="tb-quick-item">
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>
              {link.icon}
            </div>
            <span>{link.name}</span>
          </div>
        ))}
      </div>
    </>
  );
});

BannerCarousel.displayName = 'BannerCarousel';

export default BannerCarousel;