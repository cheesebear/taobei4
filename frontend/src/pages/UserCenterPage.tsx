import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ShoppingBag, Heart, MessageCircle, Settings, LogOut, ChevronRight, Star, Package, Truck, RotateCcw, Shield } from 'lucide-react';

interface Order {
  id: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'completed';
  orderDate: string;
}

interface UserCenterPageProps {
  isLoggedIn: boolean;
  username: string;
  onLogout: () => void;
}

const UserCenterPage: React.FC<UserCenterPageProps> = ({ isLoggedIn, username, onLogout }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // 模拟订单数据
  const mockOrders: Order[] = [
    {
      id: '202401150001',
      title: '苹果iPhone 15 Pro Max 256GB 深空黑色',
      image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=iPhone%2015%20Pro%20Max%20in%20deep%20space%20black%20color%2C%20product%20photography%2C%20clean%20white%20background%2C%20professional%20lighting&image_size=square',
      price: 9999,
      quantity: 1,
      status: 'delivered',
      orderDate: '2024-01-15'
    },
    {
      id: '202401120002',
      title: '华为Mate 60 Pro 12GB+512GB 雅川青',
      image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Huawei%20Mate%2060%20Pro%20smartphone%20in%20elegant%20green%20color%2C%20product%20photography%2C%20clean%20white%20background%2C%20professional%20lighting&image_size=square',
      price: 6999,
      quantity: 1,
      status: 'shipped',
      orderDate: '2024-01-12'
    }
  ];

  const getStatusText = (status: Order['status']) => {
    const statusMap = {
      pending: '待付款',
      paid: '已付款',
      shipped: '已发货',
      delivered: '已送达',
      completed: '已完成'
    };
    return statusMap[status];
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <CreditCard className="w-5 h-5 text-orange-500" />;
      case 'paid':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'completed':
        return <Star className="w-5 h-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TaobaoHeader />
        
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <User className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">请先登录</h2>
            <p className="text-gray-600 mb-6">登录后可查看个人信息和订单</p>
            <button
              onClick={() => navigate('/login')}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
            >
              立即登录
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 侧边栏 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* 用户信息 */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="w-10 h-10 text-orange-500" />
                </div>
                <h3 className="font-bold text-gray-900">{username}</h3>
                <p className="text-sm text-gray-600">普通会员</p>
              </div>

              {/* 导航菜单 */}
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'overview'
                      ? 'bg-orange-100 text-orange-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <User className="w-5 h-5 mr-3" />
                  账户概览
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'orders'
                      ? 'bg-orange-100 text-orange-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <ShoppingBag className="w-5 h-5 mr-3" />
                  我的订单
                </button>
                <button
                  onClick={() => setActiveTab('favorites')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'favorites'
                      ? 'bg-orange-100 text-orange-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Heart className="w-5 h-5 mr-3" />
                  我的收藏
                </button>
                <button
                  onClick={() => setActiveTab('addresses')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'addresses'
                      ? 'bg-orange-100 text-orange-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <MapPin className="w-5 h-5 mr-3" />
                  收货地址
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'settings'
                      ? 'bg-orange-100 text-orange-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Settings className="w-5 h-5 mr-3" />
                  账户设置
                </button>
                <button
                  onClick={onLogout}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  退出登录
                </button>
              </nav>
            </div>
          </div>

          {/* 主内容区 */}
          <div className="lg:col-span-3">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* 快捷操作 */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">快捷操作</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
                    >
                      <ShoppingBag className="w-8 h-8 text-orange-500 mb-2" />
                      <span className="text-sm font-medium">我的订单</span>
                    </button>
                    <button
                      onClick={() => navigate('/cart')}
                      className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
                    >
                      <ShoppingBag className="w-8 h-8 text-orange-500 mb-2" />
                      <span className="text-sm font-medium">购物车</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('favorites')}
                      className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
                    >
                      <Heart className="w-8 h-8 text-orange-500 mb-2" />
                      <span className="text-sm font-medium">我的收藏</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('addresses')}
                      className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
                    >
                      <MapPin className="w-8 h-8 text-orange-500 mb-2" />
                      <span className="text-sm font-medium">收货地址</span>
                    </button>
                  </div>
                </div>

                {/* 最近订单 */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900">最近订单</h2>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-orange-500 hover:text-orange-600 text-sm font-medium"
                    >
                      查看全部
                    </button>
                  </div>
                  <div className="space-y-4">
                    {mockOrders.slice(0, 2).map((order) => (
                      <div key={order.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                        <img
                          src={order.image}
                          alt={order.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">{order.title}</h3>
                          <p className="text-sm text-gray-600">订单号：{order.id}</p>
                          <p className="text-sm text-gray-600">下单时间：{order.orderDate}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">¥{order.price}</p>
                          <div className="flex items-center mt-1">
                            {getStatusIcon(order.status)}
                            <span className="ml-1 text-sm">{getStatusText(order.status)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">我的订单</h2>
                <div className="space-y-4">
                  {mockOrders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="font-medium text-gray-900">订单号：{order.id}</p>
                          <p className="text-sm text-gray-600">下单时间：{order.orderDate}</p>
                        </div>
                        <div className="flex items-center">
                          {getStatusIcon(order.status)}
                          <span className="ml-2 font-medium">{getStatusText(order.status)}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <img
                          src={order.image}
                          alt={order.title}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">{order.title}</h3>
                          <p className="text-sm text-gray-600">数量：{order.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 text-lg">¥{order.price}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'favorites' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">我的收藏</h2>
                <div className="text-center py-12">
                  <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">暂无收藏商品</p>
                </div>
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-900">收货地址</h2>
                  <button className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors">
                    添加新地址
                  </button>
                </div>
                <div className="text-center py-12">
                  <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">暂无收货地址</p>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">账户设置</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">用户名</label>
                    <input
                      type="text"
                      value={username}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">邮箱</label>
                    <input
                      type="email"
                      placeholder="请输入邮箱地址"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">手机号</label>
                    <input
                      type="tel"
                      placeholder="请输入手机号"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <button className="bg-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors">
                    保存设置
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCenterPage;