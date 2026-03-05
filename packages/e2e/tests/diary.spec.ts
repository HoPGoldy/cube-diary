import { test, expect } from "../fixtures/auth";
import dayjs from "dayjs";

test.describe("日记", () => {
  test("月历视图正常渲染", async ({ page }) => {
    const month = dayjs().format("YYYY-MM");
    await page.goto(`/month/${month}`);
    // 月份标题存在
    await expect(page.locator("body")).toContainText(dayjs().format("YYYY"));
  });

  test("从首页可以跳转到今日日记编辑页", async ({ page }) => {
    await page.goto("/");
    const today = dayjs().format("YYYY-MM-DD");
    await page.goto(`/diary/${today}`);
    await expect(page).toHaveURL(new RegExp(`/diary/${today}`));
  });

  test("日记编辑页可加载 Markdown 编辑器", async ({ page }) => {
    const today = dayjs().format("YYYY-MM-DD");
    await page.goto(`/diary/${today}`);
    // 编辑器区域存在
    await expect(page.getByTestId("diary-editor-area")).toBeVisible({
      timeout: 10000,
    });
  });

  test("保存日记后无报错弹窗", async ({ page }) => {
    const today = dayjs().format("YYYY-MM-DD");
    await page.goto(`/diary/${today}`);

    // 等待编辑器可用，直接定位 w-md-editor 的 textarea，用 force 绕过工具栏遮挡
    const editorArea = page.locator(".w-md-editor-text-input");
    await editorArea.waitFor({ timeout: 10000 });
    await editorArea.click({ force: true });
    await page.keyboard.type(" ");

    // 点击保存
    await page.getByTestId("diary-save-btn").first().click();

    // 页面上不应出现 error 级别的 antd message
    await expect(page.locator(".ant-message-error")).not.toBeVisible();
  });
});
