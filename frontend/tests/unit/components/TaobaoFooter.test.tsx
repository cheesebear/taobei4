import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TaobaoFooter from '../../../src/components/TaobaoFooter';

describe('TaobaoFooter', () => {
  describe('渲染测试', () => {
    it('应该正确渲染页脚组件', () => {
      render(<TaobaoFooter />);
      
      // 检查主要容器
      expect(document.querySelector('.tb-footer')).toBeInTheDocument();
      expect(document.querySelector('.tb-container')).toBeInTheDocument();
      expect(document.querySelector('.tb-footer-content')).toBeInTheDocument();
    });

    it('应该渲染所有页脚分区', () => {
      render(<TaobaoFooter />);
      
      // 检查三个主要分区的标题
      expect(screen.getByText('购物指南')).toBeInTheDocument();
      expect(screen.getByText('支付方式')).toBeInTheDocument();
      expect(screen.getByText('淘宝特色')).toBeInTheDocument();
      
      // 检查分区容器
      const sections = document.querySelectorAll('.tb-footer-section');
      expect(sections).toHaveLength(3);
    });

    it('应该渲染页脚底部信息', () => {
      render(<TaobaoFooter />);
      
      // 检查版权信息
      expect(screen.getByText(/© 2024 Taobao.com 版权所有/)).toBeInTheDocument();
      
      // 检查底部容器
      expect(document.querySelector('.tb-footer-bottom')).toBeInTheDocument();
    });
  });

  describe('购物指南分区测试', () => {
    it('应该渲染购物指南的所有链接', () => {
      render(<TaobaoFooter />);
      
      const shoppingGuideLinks = [
        '免费注册',
        '开通支付宝',
        '支付宝充值',
        '帮助中心',
        '联系客服',
        '购物车'
      ];
      
      shoppingGuideLinks.forEach(linkText => {
        expect(screen.getByText(linkText)).toBeInTheDocument();
      });
    });

    it('购物指南链接应该有正确的href属性', () => {
      render(<TaobaoFooter />);
      
      const shoppingGuideSection = screen.getByText('购物指南').closest('.tb-footer-section');
      const links = shoppingGuideSection?.querySelectorAll('a');
      
      links?.forEach(link => {
        expect(link).toHaveAttribute('href', '#');
      });
    });
  });

  describe('支付方式分区测试', () => {
    it('应该渲染支付方式的所有链接', () => {
      render(<TaobaoFooter />);
      
      const paymentMethodLinks = [
        '快捷支付',
        '信用卡',
        '蚂蚁花呗',
        '货到付款',
        '分期付款',
        '邮局汇款'
      ];
      
      paymentMethodLinks.forEach(linkText => {
        expect(screen.getByText(linkText)).toBeInTheDocument();
      });
    });

    it('支付方式链接应该有正确的href属性', () => {
      render(<TaobaoFooter />);
      
      const paymentSection = screen.getByText('支付方式').closest('.tb-footer-section');
      const links = paymentSection?.querySelectorAll('a');
      
      links?.forEach(link => {
        expect(link).toHaveAttribute('href', '#');
      });
    });
  });

  describe('淘宝特色分区测试', () => {
    it('应该渲染淘宝特色的所有链接', () => {
      render(<TaobaoFooter />);
      
      const taobaoFeatureLinks = [
        '手机淘宝',
        '淘宝直播',
        '淘宝二手',
        '淘宝心选',
        '淘宝吃货',
        '淘宝教育'
      ];
      
      taobaoFeatureLinks.forEach(linkText => {
        expect(screen.getByText(linkText)).toBeInTheDocument();
      });
    });

    it('淘宝特色链接应该有正确的href属性', () => {
      render(<TaobaoFooter />);
      
      const featureSection = screen.getByText('淘宝特色').closest('.tb-footer-section');
      const links = featureSection?.querySelectorAll('a');
      
      links?.forEach(link => {
        expect(link).toHaveAttribute('href', '#');
      });
    });
  });

  describe('页脚底部测试', () => {
    it('应该渲染版权信息和相关链接', () => {
      render(<TaobaoFooter />);
      
      // 检查版权信息
      expect(screen.getByText(/© 2024 Taobao.com 版权所有/)).toBeInTheDocument();
      
      // 检查法律相关链接
      expect(screen.getByText('增值电信业务经营许可证')).toBeInTheDocument();
      expect(screen.getByText('网络文化经营许可证')).toBeInTheDocument();
      expect(screen.getByText('互联网药品信息服务资格证')).toBeInTheDocument();
    });

    it('应该渲染监管和服务信息', () => {
      render(<TaobaoFooter />);
      
      expect(screen.getByText(/网络110报警服务/)).toBeInTheDocument();
      expect(screen.getByText(/不良信息举报中心/)).toBeInTheDocument();
      expect(screen.getByText(/中国文明网传播文明/)).toBeInTheDocument();
      expect(screen.getByText(/无线淘宝/)).toBeInTheDocument();
    });

    it('底部链接应该有正确的样式', () => {
      render(<TaobaoFooter />);
      
      const bottomSection = document.querySelector('.tb-footer-bottom');
      const links = bottomSection?.querySelectorAll('a');
      
      links?.forEach(link => {
        expect(link).toHaveAttribute('href', '#');
        expect(link).toHaveStyle({ color: '#999' });
      });
    });
  });

  describe('结构和样式测试', () => {
    it('应该有正确的HTML结构', () => {
      render(<TaobaoFooter />);
      
      // 检查footer标签
      const footer = document.querySelector('footer.tb-footer');
      expect(footer).toBeInTheDocument();
      
      // 检查容器结构
      const container = footer?.querySelector('.tb-container');
      expect(container).toBeInTheDocument();
      
      const content = container?.querySelector('.tb-footer-content');
      expect(content).toBeInTheDocument();
      
      const bottom = container?.querySelector('.tb-footer-bottom');
      expect(bottom).toBeInTheDocument();
    });

    it('每个分区应该有正确的结构', () => {
      render(<TaobaoFooter />);
      
      const sections = document.querySelectorAll('.tb-footer-section');
      
      sections.forEach(section => {
        // 每个分区应该有标题
        const title = section.querySelector('h4');
        expect(title).toBeInTheDocument();
        
        // 每个分区应该有链接列表
        const list = section.querySelector('ul');
        expect(list).toBeInTheDocument();
        
        // 每个列表应该有链接项
        const listItems = list?.querySelectorAll('li');
        expect(listItems?.length).toBeGreaterThan(0);
        
        // 每个链接项应该包含一个链接
        listItems?.forEach(item => {
          const link = item.querySelector('a');
          expect(link).toBeInTheDocument();
        });
      });
    });

    it('应该包含正确数量的链接', () => {
      render(<TaobaoFooter />);
      
      // 每个分区应该有6个链接
      const sections = document.querySelectorAll('.tb-footer-section');
      
      sections.forEach(section => {
        const links = section.querySelectorAll('li a');
        expect(links).toHaveLength(6);
      });
      
      // 底部应该有3个法律相关链接
      const bottomLinks = document.querySelector('.tb-footer-bottom')?.querySelectorAll('a');
      expect(bottomLinks).toHaveLength(3);
    });
  });

  describe('可访问性测试', () => {
    it('所有链接应该有文本内容', () => {
      render(<TaobaoFooter />);
      
      const allLinks = document.querySelectorAll('a');
      
      allLinks.forEach(link => {
        expect(link.textContent?.trim()).toBeTruthy();
      });
    });

    it('标题应该使用正确的语义标签', () => {
      render(<TaobaoFooter />);
      
      const titles = document.querySelectorAll('.tb-footer-section h4');
      expect(titles).toHaveLength(3);
      
      titles.forEach(title => {
        expect(title.tagName.toLowerCase()).toBe('h4');
      });
    });

    it('应该使用语义化的footer标签', () => {
      render(<TaobaoFooter />);
      
      const footer = document.querySelector('footer');
      expect(footer).toBeInTheDocument();
    });
  });
});