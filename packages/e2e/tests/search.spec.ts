import { test, expect } from "../fixtures/auth";

test.describe("搜索", () => {
  test("搜索页可以正常打开", async ({ page }) => {
    await page.goto("/search");
    await expect(page).toHaveURL(/\/search/);
  });

  test("输入关键词后可以触发搜索", async ({ page }) => {
    await page.goto("/search");

    await page.getByTestId("search-keyword-input").fill("测试");
    await page.keyboard.press("Enter");

    // 等待结果列表或空状态出现
    await expect(
      page
        .locator(
          "[data-testid='search-result-list'], [data-testid='search-empty-tip']",
        )
        .first(),
    ).toBeVisible({ timeout: 8000 });
  });

  test("无结果时显示空状态", async ({ page }) => {
    await page.goto("/search");

    // 用极不可能存在的字符串搜索
    await page
      .getByTestId("search-keyword-input")
      .fill(`__no_result_xyz_${Date.now()}__`);
    await page.keyboard.press("Enter");

    await expect(page.getByTestId("search-empty-tip")).toBeVisible({
      timeout: 8000,
    });
  });
});
