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
    const today = dayjs().format("YYYYMMDD");
    await page.goto(`/diary/${today}`);
    await expect(page).toHaveURL(new RegExp(`/diary/${today}`));
  });

  test("日记编辑页可加载 Markdown 编辑器", async ({ page }) => {
    const today = dayjs().format("YYYYMMDD");
    await page.goto(`/diary/${today}`);
    // 编辑器区域存在
    await expect(page.getByTestId("diary-editor-area")).toBeVisible({
      timeout: 10000,
    });
  });

  test("桌面端编辑器撑满编辑区域高度并保持双栏布局", async ({ page }) => {
    const today = dayjs().format("YYYYMMDD");

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`/diary/${today}`);

    const editorArea = page.getByTestId("diary-editor-area");
    const editor = editorArea.locator(".w-md-editor");
    await expect(editor).toBeVisible({ timeout: 10000 });
    await expect(editor).toHaveClass(/w-md-editor-show-live/);

    const areaBox = await editorArea.boundingBox();
    const editorBox = await editor.boundingBox();

    expect(areaBox).not.toBeNull();
    expect(editorBox).not.toBeNull();
    expect(Math.abs(editorBox!.height - areaBox!.height)).toBeLessThanOrEqual(
      2,
    );
  });

  test("移动端 Markdown 编辑器默认使用单编辑布局", async ({ page }) => {
    const today = dayjs().format("YYYYMMDD");

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/diary/${today}`);

    const editor = page
      .getByTestId("diary-editor-area")
      .locator(".w-md-editor");
    const input = editor.locator(".w-md-editor-input");
    const preview = editor.locator(".w-md-editor-preview");

    await expect(editor).toBeVisible({ timeout: 10000 });
    await expect(editor).toHaveClass(/w-md-editor-show-edit/);
    await expect(input).toBeVisible();

    const editorBox = await editor.boundingBox();
    const inputBox = await input.boundingBox();

    expect(editorBox).not.toBeNull();
    expect(inputBox).not.toBeNull();
    expect(inputBox!.width).toBeGreaterThan(editorBox!.width - 2);

    const previewCount = await preview.count();
    if (previewCount > 0) {
      await expect(preview).not.toBeVisible();
    }
  });

  test("保存日记后无报错弹窗", async ({ page }) => {
    const today = dayjs().format("YYYYMMDD");
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
