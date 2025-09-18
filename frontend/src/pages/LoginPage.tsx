import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, User, Lock, Phone, MessageSquare } from 'lucide-react';
import './LoginPage.css';

interface LoginPageProps {
  onLogin: (username: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginType, setLoginType] = useState('password'); // 'password' or 'sms'
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('请输入用户名和密码');
      return;
    }

    setLoading(true);
    setError('');
    
    // 模拟登录请求
    setTimeout(() => {
      if (username && password) {
        onLogin(username);
        setLoading(false);
        // 登录成功后跳转到首页
        window.location.href = '/';
      } else {
        setError('用户名或密码错误');
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="login-page">
      <div className="login-header">
        <div className="login-header-content">
          <Link to="/" className="login-logo">
            <h1>淘宝网</h1>
          </Link>
          <div className="login-header-links">
            <Link to="#" className="header-link">网站无障碍</Link>
            <Link to="#" className="header-link">"登录页面"改进建议</Link>
          </div>
        </div>
      </div>
      
      <div className="login-container">
        <div className="login-main">
          <div className="login-form-container">
            <div className="login-tabs">
              <button 
                className={`login-tab ${loginType === 'password' ? 'active' : ''}`}
                onClick={() => setLoginType('password')}
              >
                密码登录
              </button>
              <button 
                className={`login-tab ${loginType === 'sms' ? 'active' : ''}`}
                onClick={() => setLoginType('sms')}
              >
                短信登录
              </button>
            </div>
          
          <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="form-input"
                  placeholder="账号名/邮箱/手机号"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              
              {loginType === 'password' ? (
                <div className="form-group">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="form-input"
                    placeholder="请输入登录密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Link to="#" className="forgot-password">忘记密码</Link>
                </div>
              ) : (
                <div className="form-group">
                  <div className="sms-input-group">
                    <input
                      type="text"
                      className="form-input sms-input"
                      placeholder="请输入验证码"
                    />
                    <button type="button" className="sms-btn">获取验证码</button>
                  </div>
                </div>
              )}

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <div className="login-actions">
                <button
                  type="submit"
                  disabled={loading || !agreeTerms}
                  className="login-btn"
                >
                  {loading ? '登录中...' : '登录'}
                </button>
              </div>
              
              <div className="other-login">
                <div className="other-login-title">其他登录方式</div>
                <div className="other-login-buttons">
                  <button type="button" className="other-login-btn alipay">
                    支付宝登录
                  </button>
                  <button type="button" className="other-login-btn dingtalk">
                    钉钉登录
                  </button>
                </div>
              </div>
              
              <div className="login-links">
                <Link to="#" className="login-link">忘记账号</Link>
                <Link to="/register" className="login-link register-link">免费注册</Link>
              </div>
              
              <div className="agreement">
                <label className="agreement-label">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="agreement-checkbox"
                  />
                  已阅读并同意以下协议
                  <Link to="#" className="agreement-link">淘宝平台服务协议</Link>、
                  <Link to="#" className="agreement-link">隐私权政策</Link>、
                  <Link to="#" className="agreement-link">法律声明</Link>、
                  <Link to="#" className="agreement-link">支付宝及客户端服务协议</Link>
                </label>
              </div>

            </form>
          </div>
          
          <div className="qr-login-container">
            <div className="qr-login-title">手机扫码登录</div>
            <div className="qr-code-area">
              <img 
                src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjVGNUY1IiBzdHJva2U9IiNEREQiLz4KPHN2ZyB4PSIyMCIgeT0iMjAiIHdpZHRoPSIxMTAiIGhlaWdodD0iMTEwIj4KPHJlY3Qgd2lkdGg9IjExMCIgaGVpZ2h0PSIxMTAiIGZpbGw9IiMzMzMiLz4KPHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iOTAiIGhlaWdodD0iOTAiIGZpbGw9IndoaXRlIi8+CjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9IjcwIiBoZWlnaHQ9IjcwIiBmaWxsPSIjMzMzIi8+CjxyZWN0IHg9IjMwIiB5PSIzMCIgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4KPC9zdmc+" 
                alt="扫码登录" 
                className="qr-code"
              />
            </div>
            <p className="qr-instruction">打开 淘宝APP —点击左上角扫一扫</p>
            <Link to="#" className="qr-help">怎么扫码登录?</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;