import React, { useCallback, useMemo } from 'react';

interface CategoryNavProps {
  onCategorySelect?: (category: string) => void;
}

const CategoryNav: React.FC<CategoryNavProps> = React.memo(
  ({ onCategorySelect }) => {
    const categories = useMemo(
      () => [
        {
          name: '女装/内衣',
          subcategories: [
            '连衣裙',
            '半身裙',
            'T恤',
            '衬衫',
            '毛衣',
            '外套',
            '牛仔裤',
            '休闲裤',
            '内衣',
            '家居服',
          ],
        },
        {
          name: '男装/运动户外',
          subcategories: [
            'T恤',
            '衬衫',
            '夹克',
            '牛仔裤',
            '休闲裤',
            '运动装',
            '户外装备',
            '运动鞋',
            '板鞋',
            '皮鞋',
          ],
        },
        {
          name: '手机/数码/电脑',
          subcategories: [
            '手机',
            '平板电脑',
            '笔记本',
            '台式机',
            '数码相机',
            '摄像机',
            '耳机',
            '音响',
            '智能手表',
            '充电器',
          ],
        },
        {
          name: '家电/家具/家装',
          subcategories: [
            '电视',
            '冰箱',
            '洗衣机',
            '空调',
            '热水器',
            '沙发',
            '床',
            '衣柜',
            '餐桌',
            '灯具',
          ],
        },
        {
          name: '汽车/配件/用品',
          subcategories: [
            '轮胎',
            '机油',
            '座垫',
            '脚垫',
            '香水',
            '导航',
            '行车记录仪',
            '车载充电器',
            '防晒用品',
            '洗车用品',
          ],
        },
        {
          name: '母婴/玩具/童装',
          subcategories: [
            '奶粉',
            '纸尿裤',
            '婴儿车',
            '安全座椅',
            '玩具',
            '童装',
            '童鞋',
            '学习用品',
            '儿童家具',
            '孕妇装',
          ],
        },
        {
          name: '美妆/个护/宠物',
          subcategories: [
            '面膜',
            '护肤品',
            '彩妆',
            '香水',
            '洗发水',
            '沐浴露',
            '牙膏',
            '宠物食品',
            '宠物用品',
            '宠物玩具',
          ],
        },
        {
          name: '女鞋/箱包/配饰',
          subcategories: [
            '高跟鞋',
            '平底鞋',
            '靴子',
            '凉鞋',
            '手提包',
            '双肩包',
            '钱包',
            '首饰',
            '手表',
            '太阳镜',
          ],
        },
        {
          name: '运动/户外/乐器',
          subcategories: [
            '跑步鞋',
            '篮球鞋',
            '运动服',
            '健身器材',
            '户外装备',
            '钓鱼用品',
            '吉他',
            '钢琴',
            '小提琴',
            '架子鼓',
          ],
        },
        {
          name: '游戏/动漫/影视',
          subcategories: [
            '游戏机',
            '游戏软件',
            '手办',
            '模型',
            '漫画',
            'DVD',
            '蓝光碟',
            '游戏周边',
            '动漫周边',
            '影视周边',
          ],
        },
        {
          name: '美食/生鲜/零食',
          subcategories: [
            '水果',
            '蔬菜',
            '肉类',
            '海鲜',
            '零食',
            '饮料',
            '茶叶',
            '咖啡',
            '调料',
            '保健品',
          ],
        },
        {
          name: '鲜花/园艺/工艺',
          subcategories: [
            '鲜花',
            '绿植',
            '花盆',
            '园艺工具',
            '种子',
            '肥料',
            '手工材料',
            '工艺品',
            '装饰品',
            '收藏品',
          ],
        },
      ],
      []
    );

    const handleCategoryClick = useCallback(
      (categoryName: string) => {
        if (onCategorySelect) {
          onCategorySelect(categoryName);
        }
      },
      [onCategorySelect]
    );

    return (
      <div className='tb-category-nav'>
        <div className='tb-category-title'>商品分类</div>
        <ul className='tb-category-list'>
          {categories.map((category, index) => (
            <li key={index} className='tb-category-item'>
              <span
                className='tb-category-name'
                onClick={() => handleCategoryClick(category.name)}
              >
                {category.name}
              </span>
              <div className='tb-category-sub'>
                {category.subcategories.map((sub, subIndex) => (
                  <a
                    key={subIndex}
                    href='#'
                    className='tb-sub-link'
                    onClick={e => {
                      e.preventDefault();
                      handleCategoryClick(sub);
                    }}
                  >
                    {sub}
                  </a>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }
);

CategoryNav.displayName = 'CategoryNav';

export default CategoryNav;
