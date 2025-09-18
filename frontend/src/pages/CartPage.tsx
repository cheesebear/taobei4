import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Minus, Plus, Trash2, ArrowLeft } from 'lucide-react';

interface CartItem {
  id: number;
  title: string;
  price: number;
  originalPrice: number;
  image: string;
  quantity: number;
  selected: boolean;
  shop: string;
  specifications: string;
}

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      title: '苹果iPhone 15 Pro Max 256GB 深空黑色',
      price: 9999,
      originalPrice: 10999,
      image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=iPhone%2015%20Pro%20Max%20in%20deep%20space%20black%20color%2C%20product%20photography%2C%20clean%20white%20background%2C%20professional%20lighting&image_size=square',
      quantity: 1,
      selected: true,
      shop: '苹果官方旗舰店',
      specifications: '深空黑色 256GB'
    },
    {
      id: 2,
      title: '华为Mate 60 Pro 12GB+512GB 雅川青',
      price: 6999,
      originalPrice: 7999,
      image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Huawei%20Mate%2060%20Pro%20smartphone%20in%20elegant%20green%20color%2C%20product%20photography%2C%20clean%20white%20background%2C%20professional%20lighting&image_size=square',
      quantity: 2,
      selected: false,
      shop: '华为官方旗舰店',
      specifications: '雅川青 12GB+512GB'
    }
  ]);

  const [selectAll, setSelectAll] = useState(false);

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const toggleItemSelection = (id: number) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setCartItems(items =>
      items.map(item => ({ ...item, selected: newSelectAll }))
    );
  };

  const selectedItems = cartItems.filter(item => item.selected);
  const totalPrice = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalOriginalPrice = selectedItems.reduce((sum, item) => sum + item.originalPrice * item.quantity, 0);
  const totalSavings = totalOriginalPrice - totalPrice;

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      alert('请选择要结算的商品');
      return;
    }
    alert(`结算 ${selectedItems.length} 件商品，总计：¥${totalPrice}`);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">购物车是空的</h2>
            <p className="text-gray-600 mb-6">快去挑选喜欢的商品吧！</p>
            <button
              onClick={() => navigate('/')}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
            >
              去购物
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 面包屑导航 */}
        <nav className="text-sm text-gray-500 mb-6">
          <button onClick={() => navigate('/')} className="hover:text-orange-500 flex items-center">
            <ArrowLeft className="w-4 h-4 mr-1" />
            返回首页
          </button>
        </nav>

        <div className="bg-white rounded-lg shadow-sm">
          {/* 购物车头部 */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">购物车</h1>
            <p className="text-gray-600 mt-1">共 {cartItems.length} 件商品</p>
          </div>

          {/* 全选栏 */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">全选</span>
              </label>
              <div className="text-sm text-gray-600">
                已选择 {selectedItems.length} 件商品
              </div>
            </div>
          </div>

          {/* 购物车商品列表 */}
          <div className="divide-y divide-gray-200">
            {cartItems.map((item) => (
              <div key={item.id} className="p-6">
                <div className="flex items-start space-x-4">
                  {/* 选择框 */}
                  <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={() => toggleItemSelection(item.id)}
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500 mt-2"
                  />

                  {/* 商品图片 */}
                  <div className="flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                    />
                  </div>

                  {/* 商品信息 */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-600 mb-1">{item.shop}</p>
                    <p className="text-sm text-gray-500 mb-2">{item.specifications}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline">
                        <span className="text-xl font-bold text-red-600">¥{item.price}</span>
                        <span className="ml-2 text-sm text-gray-500 line-through">¥{item.originalPrice}</span>
                      </div>
                      
                      {/* 数量控制 */}
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center border border-gray-300 rounded">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-gray-100 disabled:opacity-50"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                            className="w-12 px-2 py-1 text-center border-0 focus:ring-0"
                            min="1"
                          />
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-gray-100"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          title="删除商品"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 结算栏 */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">全选</span>
              </label>
              <span className="text-sm text-gray-600">
                已选择 {selectedItems.length} 件商品
              </span>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className="text-sm text-gray-600">
                  合计：
                  <span className="text-2xl font-bold text-red-600 ml-1">¥{totalPrice}</span>
                </div>
                {totalSavings > 0 && (
                  <div className="text-sm text-green-600">
                    已优惠：¥{totalSavings}
                  </div>
                )}
              </div>
              
              <button
                onClick={handleCheckout}
                disabled={selectedItems.length === 0}
                className="bg-orange-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                结算 ({selectedItems.length})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;