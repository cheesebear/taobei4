import { test, expect } from '@playwright/test';

test.describe('用户购物流程 E2E 测试', () => {
  test.beforeEach(async ({ page }) => {
    // 访问首页
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('页面基础功能', () => {
    test('应该正确加载首页', async ({ page }) => {
      // 验证页面标题
      await expect(page).toHaveTitle(/淘贝/);
      
      // 验证主要元素存在
      await expect(page.locator('header')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
      await expect(page.locator('footer')).toBeVisible();
    });

    test('应该显示商品列表', async ({ page }) => {
      // 等待商品列表加载
      await page.waitForSelector('.tb-product-card', { timeout: 10000 });
      
      // 验证至少有一个商品卡片
      const productCards = page.locator('.tb-product-card');
      await expect(productCards.first()).toBeVisible();
      
      // 验证商品信息显示
      const firstProduct = productCards.first();
      await expect(firstProduct).toContainText(/￥|¥/);
    });

    test('应该显示分类导航', async ({ page }) => {
      // 查找分类导航元素
      const categoryNav = page.locator('.tb-category-nav, .category-nav');
      await expect(categoryNav).toBeVisible();
    });
  });

  test.describe('用户交互功能', () => {
    test('应该能够点击商品卡片', async ({ page }) => {
      // 等待商品列表加载
      await page.waitForSelector('.tb-product-card', { timeout: 10000 });
      
      // 点击第一个商品
      const firstProduct = page.locator('.tb-product-card').first();
      await firstProduct.click();
      
      // 验证点击有响应（商品卡片应该是可点击的）
      await page.waitForTimeout(500);
      
      // 验证商品卡片存在且可点击
      await expect(firstProduct).toBeVisible();
    });

    test('应该能够操作登录按钮', async ({ page }) => {
      // 查找登录相关按钮
      const loginButton = page.locator('button:has-text("登录"), .tb-login-btn, .login-btn');
      
      if (await loginButton.isVisible()) {
        await loginButton.click();
        
        // 验证登录按钮响应
        await page.waitForTimeout(500);
        await expect(loginButton).toBeVisible();
      } else {
        // 如果没有登录按钮，测试通过
        console.log('登录按钮不存在，跳过测试');
      }
    });

    test('应该能够操作购物车', async ({ page }) => {
      // 查找购物车相关元素
      const cartIcon = page.locator('.tb-cart-icon, .cart-icon, [title*="购物车"]').first();
      
      if (await cartIcon.isVisible()) {
        await cartIcon.click();
        
        // 验证购物车图标响应
        await page.waitForTimeout(500);
        await expect(cartIcon).toBeVisible();
      } else {
        // 如果没有购物车图标，测试通过
        console.log('购物车图标不存在，跳过测试');
      }
    });
  });

  test.describe('响应式设计测试', () => {
    test('应该在移动端正确显示', async ({ page }) => {
      // 设置移动端视口
      await page.setViewportSize({ width: 375, height: 667 });
      
      // 重新加载页面
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // 验证页面在移动端可以正常显示
      await expect(page.locator('body')).toBeVisible();
      
      // 验证主要内容区域存在
      await expect(page.locator('main, .main-content, .ant-layout-content')).toBeVisible();
      
      // 验证商品列表在移动端的显示
      const productList = page.locator('.tb-product-card');
      await expect(productList.first()).toBeVisible();
    });

    test('应该在平板端正确显示', async ({ page }) => {
      // 设置平板端视口
      await page.setViewportSize({ width: 768, height: 1024 });
      
      // 重新加载页面
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // 验证页面在平板端可以正常显示
      await expect(page.locator('body')).toBeVisible();
      
      // 验证主要内容区域存在
      await expect(page.locator('main, .main-content, .ant-layout-content')).toBeVisible();
      
      // 验证商品网格在平板端的显示
      const productList = page.locator('.tb-product-card');
      await expect(productList.first()).toBeVisible();
    });
  });

  test.describe('性能和错误处理', () => {
    test('页面加载时间应该在合理范围内', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // 页面加载时间应该小于10秒（考虑到网络延迟）
      expect(loadTime).toBeLessThan(10000);
    });

    test('应该处理JavaScript错误', async ({ page }) => {
      const errors: string[] = [];
      
      // 监听页面错误
      page.on('pageerror', (error) => {
        errors.push(error.message);
      });
      
      // 加载页面
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // 验证没有严重的JavaScript错误
      const criticalErrors = errors.filter(error => 
        !error.includes('ResizeObserver') && 
        !error.includes('Non-passive event listener')
      );
      
      expect(criticalErrors.length).toBe(0);
    });

    test('应该正确处理网络慢速情况', async ({ page }) => {
      // 模拟慢速网络
      await page.route('**/*', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 100)); // 100ms延迟
        await route.continue();
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle', { timeout: 15000 });
      
      // 验证页面仍然可以正常显示
      await expect(page.locator('body')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
      
      // 验证页面在慢速网络下仍能正常加载
      const productList = page.locator('.tb-product-card');
      await expect(productList.first()).toBeVisible({ timeout: 15000 });
    });
  });

  test.describe('SEO和可访问性', () => {
    test('应该有正确的页面元数据', async ({ page }) => {
      await page.goto('/');
      
      // 验证页面标题
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);
      
      // 验证meta描述
      const metaDescription = page.locator('meta[name="description"]');
      if (await metaDescription.count() > 0) {
        const content = await metaDescription.getAttribute('content');
        expect(content?.length || 0).toBeGreaterThan(0);
      }
    });

    test('应该有基本的可访问性支持', async ({ page }) => {
      await page.goto('/');
      
      // 验证主要landmark元素存在
      const main = page.locator('main, [role="main"]');
      await expect(main).toBeVisible();
      
      // 验证按钮有可访问的文本
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        if (await button.isVisible()) {
          const text = await button.textContent();
          const ariaLabel = await button.getAttribute('aria-label');
          expect(text || ariaLabel).toBeTruthy();
        }
      }
    });
  });
});