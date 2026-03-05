import { test, expect } from "@playwright/test";

const PASSWORD = process.env.E2E_LOGIN_PASSWORD ?? "admin";

test.describe("认证", () => {
  test("未登录访问首页应重定向到登录页", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
  });

  test("密码错误时显示错误提示", async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("login-password-input").fill("wrong-password-123");
    await page.getByTestId("login-submit-btn").click();
    // 登录失败，停留在登录页
    await expect(page).toHaveURL(/\/login/);
  });

  test("密码正确时成功登录并跳转首页", async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("login-password-input").fill(PASSWORD);
    await page.getByTestId("login-submit-btn").click();
    await expect(page).not.toHaveURL(/\/login/);
  });

  test("登录成功后 token 写入 localStorage", async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("login-password-input").fill(PASSWORD);
    await page.getByTestId("login-submit-btn").click();
    await expect(page).not.toHaveURL(/\/login/);

    const token = await page.evaluate(() =>
      localStorage.getItem("$cube-diary-access-token"),
    );
    expect(token).toBeTruthy();
  });
});
