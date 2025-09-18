import React, { useMemo } from 'react';

const TaobaoFooter: React.FC = React.memo(() => {
  const footerSections = useMemo(
    () => [
      {
        title: '购物指南',
        links: [
          { name: '免费注册', href: '#' },
          { name: '开通支付宝', href: '#' },
          { name: '支付宝充值', href: '#' },
          { name: '帮助中心', href: '#' },
          { name: '联系客服', href: '#' },
          { name: '购物车', href: '#' },
        ],
      },
      {
        title: '支付方式',
        links: [
          { name: '快捷支付', href: '#' },
          { name: '信用卡', href: '#' },
          { name: '蚂蚁花呗', href: '#' },
          { name: '货到付款', href: '#' },
          { name: '分期付款', href: '#' },
          { name: '邮局汇款', href: '#' },
        ],
      },
      {
        title: '淘宝特色',
        links: [
          { name: '手机淘宝', href: '#' },
          { name: '淘宝直播', href: '#' },
          { name: '淘宝二手', href: '#' },
          { name: '淘宝心选', href: '#' },
          { name: '淘宝吃货', href: '#' },
          { name: '淘宝教育', href: '#' },
        ],
      },
    ],
    []
  );

  return (
    <footer className='tb-footer'>
      <div className='tb-container'>
        <div className='tb-footer-content'>
          {footerSections.map((section, index) => (
            <div key={index} className='tb-footer-section'>
              <h4>{section.title}</h4>
              <ul>
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a href={link.href}>{link.name}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className='tb-footer-bottom'>
          <p>
            © 2024 Taobao.com 版权所有 |
            <a href='#' style={{ color: '#999', marginLeft: '5px' }}>
              增值电信业务经营许可证
            </a>{' '}
            |
            <a href='#' style={{ color: '#999', marginLeft: '5px' }}>
              网络文化经营许可证
            </a>{' '}
            |
            <a href='#' style={{ color: '#999', marginLeft: '5px' }}>
              互联网药品信息服务资格证
            </a>
          </p>
          <p style={{ marginTop: '10px' }}>
            网络110报警服务 | 不良信息举报中心 | 中国文明网传播文明 | 无线淘宝
          </p>
        </div>
      </div>
    </footer>
  );
});

TaobaoFooter.displayName = 'TaobaoFooter';

export default TaobaoFooter;
