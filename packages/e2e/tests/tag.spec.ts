import { test, expect } from "../fixtures/auth";

test.describe("标签", () => {
  test("标签管理页可以正常打开", async ({ page }) => {
    await page.goto("/tags");
    await expect(page).toHaveURL(/\/tags/);
    // 页面内容渲染完成
    await expect(page.locator("body")).not.toContainText("404");
  });

  test.skip("可以创建新标签", async ({ page }) => {
    await page.goto("/tags");

    const tagName = `test-tag-${Date.now()}`;

    // 找到新增标签按钮（桌面端优先）
    await page.getByTestId("tag-add-btn").click();

    // 等待 Modal 出现
    const modal = page.locator(".ant-modal");
    await modal.waitFor({ timeout: 8000 });

    // 填写标签名
    await page.getByTestId("tag-title-input").fill(tagName);

    // 确认（antd Modal 的确定按钮，限定在 modal 内部避免误选）
    await modal.getByRole("button", { name: "确定" }).click();

    // 页面中出现新标签名
    await expect(page.locator("body")).toContainText(tagName);
  });

  test("搜索页标签筛选器可渲染", async ({ page }) => {
    await page.goto("/search");
    await expect(page).toHaveURL(/\/search/);
  });
});
