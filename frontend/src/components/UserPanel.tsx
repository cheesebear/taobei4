import React, { useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';

interface UserPanelProps {
  isLoggedIn?: boolean;
  userName?: string;
  userAvatar?: string;
  onLogin?: () => void;
  onLogout?: () => void;
  onRegister?: () => void;
}

const UserPanel: React.FC<UserPanelProps> = React.memo(
  ({
    isLoggedIn = false,
    userName = '',
    userAvatar = '',
    onLogin,
    onLogout,
    onRegister,
  }) => {
    const userLinks = useMemo(
      () => [
        { name: '我的淘贝', href: '/user' },
        { name: '已买到的宝贝', href: '/user' },
        { name: '我的足迹', href: '/user' },
        { name: '收藏夹', href: '/user' },
        { name: '我的优惠券', href: '/user' },
        { name: '我的红包', href: '/user' },
        { name: '淘金币', href: '/user' },
        { name: '购物车', href: '/cart' },
      ],
      []
    );

    const defaultAvatar = useMemo(
      () =>
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMzAiIGZpbGw9IiNGNUY1RjUiLz4KPGNpcmNsZSBjeD0iMzAiIGN5PSIyMiIgcj0iMTAiIGZpbGw9IiM5OTkiLz4KPHBhdGggZD0iTTEwIDUwQzEwIDQwIDIwIDM1IDMwIDM1UzUwIDQwIDUwIDUwIiBmaWxsPSIjOTk5Ii8+Cjwvc3ZnPg==',
      []
    );

    const handleLogout = useCallback(
      (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        onLogout && onLogout();
      },
      [onLogout]
    );

    return (
      <div className='tb-user-panel'>
        {!isLoggedIn ? (
          <>
            {/* 未登录状态 */}
            <div className='tb-login-panel'>
              <div className='tb-avatar'>
                <img src={defaultAvatar} alt='用户头像' />
              </div>
              <div className='tb-login-text'>
                <p>Hi! 欢迎来到淘贝课堂</p>
                <div className='tb-login-links'>
                  <Link to='/login'>
                    登录
                  </Link>
                  <Link to='/register'>
                    注册
                  </Link>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* 已登录状态 */}
            <div className='tb-login-panel'>
              <div className='tb-avatar'>
                <img src={userAvatar || defaultAvatar} alt='用户头像' />
              </div>
              <div className='tb-login-text'>
                <p>Hi! {userName}</p>
                <div className='tb-login-links'>
                  <Link to='/user'>个人中心</Link>
                  <a href='#' onClick={handleLogout}>退出登录</a>
                </div>
              </div>
            </div>
          </>
        )}

        {/* 用户功能链接 */}
        <div className='tb-user-links'>
          {userLinks.map((link, index) => (
            <Link key={index} to={link.href} className='tb-user-link'>
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    );
  }
);

UserPanel.displayName = 'UserPanel';

export default UserPanel;
