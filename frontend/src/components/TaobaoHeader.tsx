import React, { useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';

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
  const [searchQuery, setSearchQuery] = React.useState('');

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
                <span className='tb-divider'>|</span>
                <Link to='/register' className='tb-link'>
                  免费注册
                </Link>
              </>
            ) : (
              <>
                <span className='tb-link'>Hi! {userName}</span>
                <span className='tb-divider'>|</span>
                <a href='#' className='tb-link' onClick={(e) => { e.preventDefault(); onLogout && onLogout(); }}>
                  退出登录
                </a>
              </>
            )}
            <span className='tb-divider'>|</span>
            <Link to='/user' className='tb-link'>
              我的淘贝
            </Link>
            <span className='tb-divider'>|</span>
            <Link to='/cart' className='tb-link'>
              购物车
            </Link>
            <span className='tb-divider'>|</span>
            <Link to='/user' className='tb-link'>
              收藏夹
            </Link>
            <span className='tb-divider'>|</span>
            <a href='#' className='tb-link'>
              商品分类
            </a>
            <span className='tb-divider'>|</span>
            <a href='#' className='tb-link'>
              卖家中心
            </a>
            <span className='tb-divider'>|</span>
            <a href='#' className='tb-link'>
              联系客服
            </a>
            <span className='tb-divider'>|</span>
            <a href='#' className='tb-link'>
              网站导航
            </a>
          </div>
        </div>
      </div>

      {/* 主导航区域 */}
      <div className='tb-main-header'>
        <div className='tb-container'>
          <div className='tb-header-content'>
            {/* Logo */}
            <div className='tb-logo'>
              <Link to='/'>
                <img
                  src='https://img.alicdn.com/tfs/TB1_uT8a5ERMeJjSspiXXbZLFXa-143-59.png'
                  alt='淘贝课堂'
                  onError={handleLogoError}
                />
              </Link>
            </div>

            {/* 搜索区域 */}
            <div className='tb-search-area'>
              <div className='tb-search-box'>
                <input
                  type='text'
                  className='tb-search-input'
                  placeholder='搜索 淘贝课堂'
                  value={searchQuery}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyPress}
                />
                <button className='tb-search-btn' onClick={handleSearch}>
                  搜索
                </button>
              </div>
              <div className='tb-search-suggestions'>
                <a href='#'>连衣裙</a>
                <a href='#'>手机</a>
                <a href='#'>电脑</a>
                <a href='#'>家居</a>
                <a href='#'>美妆</a>
                <a href='#'>运动</a>
                <a href='#'>数码</a>
                <a href='#'>母婴</a>
              </div>
            </div>

            {/* 二维码区域 */}
            <div className='tb-qr-area'>
              <div className='tb-qr-code'>
                <img
                  src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjVGNUY1IiBzdHJva2U9IiNEREQiLz4KPHN2ZyB4PSIxMCIgeT0iMTAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxyZWN0IHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0iIzMzMyIvPgo8cmVjdCB4PSI1IiB5PSI1IiB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIGZpbGw9IndoaXRlIi8+CjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjMzMzIi8+CjxyZWN0IHg9IjE1IiB5PSIxNSIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4KPC9zdmc+'
                  alt='手机淘宝'
                />
                <span>手机淘宝</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 导航菜单 */}
      <div className='tb-nav-menu'>
        <div className='tb-container'>
          <div className='tb-nav-links'>
            <Link to='/' className='tb-nav-link'>
              首页
            </Link>
            <a href='#' className='tb-nav-link'>
              课程分类
            </a>
            <a href='#' className='tb-nav-link'>
              热门课程
            </a>
            <a href='#' className='tb-nav-link'>
              免费课程
            </a>
            <a href='#' className='tb-nav-link'>
              直播课堂
            </a>
            <a href='#' className='tb-nav-link'>
              学习路径
            </a>
            <a href='#' className='tb-nav-link'>
              实战项目
            </a>
            <a href='#' className='tb-nav-link'>
              认证考试
            </a>
            <a href='#' className='tb-nav-link'>
              企业培训
            </a>
            <a href='#' className='tb-nav-link'>
              帮助中心
            </a>
          </div>
        </div>
      </div>
    </>
  );
});

TaobaoHeader.displayName = 'TaobaoHeader';

export default TaobaoHeader;
