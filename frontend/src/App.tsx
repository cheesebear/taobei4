import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import UserCenterPage from './pages/UserCenterPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TaobaoHeader from './components/TaobaoHeader';
import TaobaoFooter from './components/TaobaoFooter';



const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    console.log('淘贝课堂应用加载完成');
  }, []);

  const handleLogin = (username: string) => {
    setIsLoggedIn(true);
    setUserName(username);
    navigate('/');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName('');
    navigate('/');
  };

  const handleSearch = (query: string) => {
    // Handle search functionality
    console.log('搜索:', query);
  };

  const handleRegister = (username: string) => {
    setIsLoggedIn(true);
    setUserName(username);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TaobaoHeader 
        isLoggedIn={isLoggedIn}
        userName={userName}
        onLogin={() => navigate('/login')}
        onLogout={handleLogout}
        onSearch={handleSearch} 
      />
      
      <Routes>
        <Route path="/" element={<HomePage 
          isLoggedIn={isLoggedIn}
          username={userName}
          onLogin={handleLogin}
          onLogout={handleLogout}
          onRegister={handleRegister}
        />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/user" element={<UserCenterPage isLoggedIn={isLoggedIn} userName={userName} />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/register" element={<RegisterPage onRegister={handleRegister} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      <TaobaoFooter />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
