import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import './TaobaoHeader.css';

interface TaobaoHeaderProps {
  isLoggedIn?: boolean;
  userName?: string;
  onLogin?: () => void;
  onLogout?: () => void;
  onSearch?: (query: string) => void;
}

const TaobaoHeader: React.FC<TaobaoHeaderProps> = React.memo(({ 
  isLoggedIn = false,
  userName = '',
  onLogin,
  onLogout,
  onSearch 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('宝贝');

  const handleSearch = useCallback(() => {
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  }, [onSearch, searchQuery]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    },
    [handleSearch]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    []
  );

  const handleLogoError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const target = e.target as HTMLImageElement;
      target.src =
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQzIiBoZWlnaHQ9IjU5IiB2aWV3Qm94PSIwIDAgMTQzIDU5IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTQzIiBoZWlnaHQ9IjU5IiBmaWxsPSIjRkY2NjAwIi8+Cjx0ZXh0IHg9IjcxLjUiIHk9IjM1IiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPua3mOWunTwvdGV4dD4KPC9zdmc+';
    },
    []
  );

  return (
    <>
      {/* 顶部导航栏 */}
      <div className='tb-top-nav'>
        <div className='tb-container'>
          <div className='tb-top-left'>
            <span>中国大陆</span>
          </div>
          <div className='tb-top-right'>
            {!isLoggedIn ? (
              <>
                <Link to='/login' className='tb-link'>
                  亲，请登录
                </Link>
                <Link to='/register' className='tb-link'>
                  免费注册
                </Link>
              </>
            ) : (
              <>
                <span className='tb-link'>Hi! {userName}</span>
                <a href='#' className='tb-link' onClick={(e) => { e.preventDefault(); onLogout && onLogout(); }}>
                  退出登录
                </a>
              </>
            )}
            <a href='#' className='tb-link'>
              网页无障碍
            </a>
            <a href='#' className='tb-link'>
              切换企业版
            </a>
            <span className='tb-link'>选择主题</span>
            <span className='tb-link'>Language</span>
          </div>
        </div>
      </div>
      
      {/* 第二行导航 */}
      <div className='tb-second-nav'>
        <div className='tb-container'>
          <div className='tb-second-nav-content'>
            <Link to='/user' className='tb-link'>
              已买到的宝贝
            </Link>
            <Link to='/user' className='tb-link'>
              我的淘宝
            </Link>
            <Link to='/cart' className='tb-link'>
              <span className='tb-cart-icon'>🛒</span> 购物车
            </Link>
            <Link to='/user' className='tb-link'>
              <span className='tb-fav-icon'>⭐</span> 收藏夹
            </Link>
            <a href='#' className='tb-link'>
              免费开店
            </a>
            <a href='#' className='tb-link'>
              千牛卖家中心
            </a>
            <a href='#' className='tb-link'>
              帮助中心
            </a>
          </div>
         </div>
       </div>

      {/* 主导航区域 */}
      <div className='tb-main-nav'>
        <div className='tb-container'>
          <div className='tb-main-nav-content'>
            {/* Logo */}
            <div className='tb-logo'>
              <Link to='/'>
                <img
                  src='https://img.alicdn.com/tfs/TB1_uT8a5ERMeJjSspiXXbZLFXa-143-59.png'
                  alt='淘宝网'
                  onError={handleLogoError}
                />
              </Link>
            </div>

            {/* 搜索区域 */}
            <div className='tb-search-area'>
              <div className='tb-search-tabs'>
                <button 
                  className={`tb-search-tab ${searchType === '宝贝' ? 'active' : ''}`}
                  onClick={() => setSearchType('宝贝')}
                >
                  宝贝
                </button>
                <button 
                  className={`tb-search-tab ${searchType === '店铺' ? 'active' : ''}`}
                  onClick={() => setSearchType('店铺')}
                >
                  店铺
                </button>
              </div>
              <div className='tb-search-box'>
                <input
                  type='text'
                  placeholder='搜索 淘宝 商品/店铺/品牌'
                  value={searchQuery}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyPress}
                  className='tb-search-input'
                />
                <button onClick={handleSearch} className='tb-search-btn'>
                  搜索
                </button>
              </div>
              {/* 搜索建议 */}
              <div className='tb-search-suggest'>
                <a href='#'>连衣裙</a>
                <a href='#'>手机</a>
                <a href='#'>电脑</a>
                <a href='#'>家居</a>
                <a href='#'>美妆</a>
                <a href='#'>运动</a>
                <a href='#'>母婴</a>
              </div>
            </div>

            {/* 右侧功能区域 */}
            <div className='tb-right-area'>
              <div className='tb-qr-area'>
                <div className='tb-qr-code'>
                  <img src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjMwIiB5PSIzNSIgZmlsbD0iIzk5OTk5OSIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UVLnoIE8L3RleHQ+Cjwvc3ZnPg==' alt='二维码' />
                  <p>手机淘宝</p>
                </div>
              </div>
              <div className='tb-user-tools'>
                <Link to='/user' className='tb-tool-link'>
                  <span className='tb-icon'>👤</span>
                  <span>会员中心</span>
                </Link>
                <Link to='/cart' className='tb-tool-link'>
                  <span className='tb-icon'>🛒</span>
                  <span>购物车</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 导航菜单 */}
      <div className='tb-nav-menu'>
        <div className='tb-container'>
          <div className='tb-nav-menu-content'>
            <Link to='/' className='tb-nav-item active'>
              首页
            </Link>
            <a href='#' className='tb-nav-item'>
              天猫
            </a>
            <a href='#' className='tb-nav-item'>
              聚划算
            </a>
            <a href='#' className='tb-nav-item'>
              天猫超市
            </a>
            <a href='#' className='tb-nav-item'>
              天猫国际
            </a>
            <a href='#' className='tb-nav-item'>
              飞猪旅行
            </a>
            <a href='#' className='tb-nav-item'>
              苏宁易购
            </a>
            <a href='#' className='tb-nav-item'>
              淘宝心选
            </a>
            <a href='#' className='tb-nav-item'>
              1688
            </a>
          </div>
        </div>
      </div>
    </>
  );
});

TaobaoHeader.displayName = 'TaobaoHeader';

export default TaobaoHeader;
