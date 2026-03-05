import { test, expect } from "../fixtures/auth";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test.describe("附件", () => {
  test("附件 demo 页可以正常访问", async ({ page }) => {
    await page.goto("/file-demo");
    await expect(page).toHaveURL(/\/file-demo/);
  });

  test("可以上传图片文件", async ({ page }) => {
    await page.goto("/file-demo");

    // 等待上传区域出现，再定位内部的 file input
    const uploadArea = page.getByTestId("file-upload-area");
    await uploadArea.waitFor({ timeout: 8000 });
    const uploadInput = uploadArea.locator("input[type='file']");

    // 上传一个测试用的小图
    const testImagePath = path.join(__dirname, "../assets/test-image.png");
    await uploadInput.setInputFiles(testImagePath);

    // 不应出现接口报错
    await expect(page.locator(".ant-message-error")).not.toBeVisible({
      timeout: 8000,
    });
  });
});
