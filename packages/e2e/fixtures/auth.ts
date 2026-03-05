import { test as base, expect } from "@playwright/test";

const LOGIN_PASSWORD = process.env.E2E_LOGIN_PASSWORD ?? "admin";

/**
 * 已登录的 page fixture
 * 在每个使用此 fixture 的测试开始前自动完成登录
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.goto("/login");
    await page.getByTestId("login-password-input").fill(LOGIN_PASSWORD);
    await page.getByTestId("login-submit-btn").click();
    // 等待跳转到首页
    await expect(page).not.toHaveURL(/\/login/);
    await use(page);
  },
});

export { expect };
