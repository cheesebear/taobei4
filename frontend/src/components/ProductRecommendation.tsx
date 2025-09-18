import React, { useCallback, useMemo } from 'react';

interface Product {
  id: number;
  title: string;
  price: string;
  image: string;
  tag?: string;
}

interface ProductRecommendationProps {
  onProductClick?: (product: Product) => void;
}

const ProductRecommendation: React.FC<ProductRecommendationProps> = React.memo(
  ({ onProductClick }) => {
    const recommendedProducts: Product[] = useMemo(
      () => [
        {
          id: 1,
          title: '秋冬新款毛衣',
          price: '¥89',
          image:
            'https://img.alicdn.com/imgextra/i1/6000000007738/O1CN01P3E4BD1yzJ8e4BD53_!!6000000007738-0-tps-200-200.jpg',
          tag: '热销',
        },
        {
          id: 2,
          title: '无线蓝牙耳机',
          price: '¥199',
          image:
            'https://img.alicdn.com/imgextra/i2/6000000007738/O1CN01Q4F5CE1yzJ8f5CE64_!!6000000007738-0-tps-200-200.jpg',
          tag: '新品',
        },
        {
          id: 3,
          title: '运动休闲鞋',
          price: '¥299',
          image:
            'https://img.alicdn.com/imgextra/i3/6000000007738/O1CN01R5G6DF1yzJ8g6DF75_!!6000000007738-0-tps-200-200.jpg',
          tag: '爆款',
        },
        {
          id: 4,
          title: '护肤套装',
          price: '¥159',
          image:
            'https://img.alicdn.com/imgextra/i4/6000000007738/O1CN01S6H7EG1yzJ8h7EG86_!!6000000007738-0-tps-200-200.jpg',
          tag: '特价',
        },
        {
          id: 5,
          title: '智能手表',
          price: '¥399',
          image:
            'https://img.alicdn.com/imgextra/i1/6000000007738/O1CN01T7I8FH1yzJ8i8FH97_!!6000000007738-0-tps-200-200.jpg',
          tag: '推荐',
        },
        {
          id: 6,
          title: '家居收纳盒',
          price: '¥39',
          image:
            'https://img.alicdn.com/imgextra/i2/6000000007738/O1CN01U8J9GI1yzJ8j9GI08_!!6000000007738-0-tps-200-200.jpg',
          tag: '实用',
        },
      ],
      []
    );

    const handleProductClick = useCallback(
      (product: Product) => {
        if (onProductClick) {
          onProductClick(product);
        }
      },
      [onProductClick]
    );

    const handleImageError = useCallback(
      (e: React.SyntheticEvent<HTMLImageElement>, product: Product) => {
        const target = e.target as HTMLImageElement;
        // 创建一个简单的商品占位图
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 80;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // 背景
          ctx.fillStyle = '#f5f5f5';
          ctx.fillRect(0, 0, 100, 80);

          // 边框
          ctx.strokeStyle = '#ddd';
          ctx.strokeRect(0, 0, 100, 80);

          // 商品图标
          ctx.fillStyle = '#999';
          ctx.font = '24px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('📦', 50, 35);

          // 商品名称
          ctx.font = '10px Arial';
          ctx.fillText(product.title.substring(0, 8), 50, 55);
        }
        target.src = canvas.toDataURL();
      },
      []
    );

    return (
      <div className='tb-product-recommendation'>
        <h3
          style={{
            fontSize: '14px',
            fontWeight: 'bold',
            marginBottom: '15px',
            color: '#333',
            borderBottom: '2px solid #ff6600',
            paddingBottom: '5px',
          }}
        >
          为你推荐
        </h3>

        <div className='tb-product-grid'>
          {recommendedProducts.map(product => (
            <div
              key={product.id}
              className='tb-product-card'
              onClick={() => handleProductClick(product)}
            >
              <img
                src={product.image}
                alt={product.title}
                onError={e => handleImageError(e, product)}
              />
              <div className='tb-product-info'>
                <div className='tb-product-price'>{product.price}</div>
                <div className='tb-product-tag'>{product.tag}</div>
              </div>
            </div>
          ))}
        </div>

        {/* 更多推荐链接 */}
        <div
          style={{
            textAlign: 'center',
            marginTop: '15px',
            paddingTop: '10px',
            borderTop: '1px solid #f0f0f0',
          }}
        >
          <a
            href='#'
            style={{
              color: '#ff6600',
              textDecoration: 'none',
              fontSize: '12px',
            }}
            onMouseOver={e => {
              e.currentTarget.style.textDecoration = 'underline';
            }}
            onMouseOut={e => {
              e.currentTarget.style.textDecoration = 'none';
            }}
          >
            查看更多推荐 →
          </a>
        </div>
      </div>
    );
  }
);

ProductRecommendation.displayName = 'ProductRecommendation';

export default ProductRecommendation;
