import { test, expect } from "../fixtures/auth";
import type { Page } from "@playwright/test";

const BASE = "/api";

/**
 * 从已登录的 page 中取出 JWT token，用于后续 API 调用
 */
const getJwtToken = (page: Page) =>
  page.evaluate(() => localStorage.getItem("$cube-diary-access-token") ?? "");

test.describe("Access Token 模块", () => {
  /** 记录本次测试创建的 token id，供后续用例清理 */
  let createdTokenId: string;
  /** 创建成功后返回的完整明文 token */
  let createdTokenPlain: string;

  test("未登录时无法访问 access-tokens 接口", async ({ page }) => {
    // 使用一个全新的独立 request context（不带任何 cookie/header）
    const resp = await page.request.get(`${BASE}/access-tokens`, {
      headers: { Authorization: "" },
    });
    expect(resp.status()).toBe(401);
  });

  test("可以创建 Access Token", async ({ page }) => {
    const jwt = await getJwtToken(page);

    const resp = await page.request.post(`${BASE}/access-tokens`, {
      data: { name: "e2e-test-token" },
      headers: { Authorization: `Bearer ${jwt}` },
    });

    expect(resp.ok()).toBeTruthy();

    const body = await resp.json();
    expect(body.success).toBe(true);
    expect(body.data).toMatchObject({
      name: "e2e-test-token",
    });
    // 明文 token 存在（64 位 hex）
    expect(body.data.token).toMatch(/^[0-9a-f]{64}$/);
    // prefix 是 token 的前 8 位
    expect(body.data.token.startsWith(body.data.tokenPrefix)).toBe(true);
    // 有 id 和 createdAt
    expect(body.data.id).toBeTruthy();
    expect(body.data.createdAt).toBeTruthy();

    createdTokenId = body.data.id;
    createdTokenPlain = body.data.token;
  });

  test("创建的 token 出现在列表中", async ({ page }) => {
    const jwt = await getJwtToken(page);

    const resp = await page.request.get(`${BASE}/access-tokens`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });

    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
    expect(body.success).toBe(true);

    const found = body.data.find(
      (t: { id: string }) => t.id === createdTokenId,
    );
    expect(found).toBeDefined();
    // 列表中不包含完整 hash 或明文 token
    expect(found.tokenHash).toBeUndefined();
    expect(found.token).toBeUndefined();
  });

  test("exchange 端点用有效 access token 换取 JWT 成功", async ({ page }) => {
    const resp = await page.request.post(`${BASE}/access-tokens/exchange`, {
      data: { token: createdTokenPlain },
      headers: { "Content-Type": "application/json" },
    });
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body.success).toBe(true);
    expect(typeof body.data.accessToken).toBe("string");
    expect(body.data.accessToken.length).toBeGreaterThan(0);

    // 验证兑换出的 JWT 可访问受保护接口
    const diaryResp = await page.request.get(`${BASE}/diary`, {
      headers: { Authorization: `Bearer ${body.data.accessToken}` },
    });
    expect(diaryResp.status()).not.toBe(401);
  });

  test("exchange 端点用无效 token 返回 401", async ({ page }) => {
    const resp = await page.request.post(`${BASE}/access-tokens/exchange`, {
      data: { token: "invalid-token-that-does-not-exist" },
      headers: { "Content-Type": "application/json" },
    });
    expect(resp.status()).toBe(401);
  });

  test("可以删除 Access Token", async ({ page }) => {
    const jwt = await getJwtToken(page);

    const resp = await page.request.delete(
      `${BASE}/access-tokens/${createdTokenId}`,
      { headers: { Authorization: `Bearer ${jwt}` } },
    );

    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
    expect(body.success).toBe(true);
  });

  test("删除后 token 不再出现在列表中", async ({ page }) => {
    const jwt = await getJwtToken(page);

    const resp = await page.request.get(`${BASE}/access-tokens`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });

    const body = await resp.json();
    const found = body.data.find(
      (t: { id: string }) => t.id === createdTokenId,
    );
    expect(found).toBeUndefined();
  });

  test("删除后原 token 兑换 JWT 返回 401", async ({ page }) => {
    const resp = await page.request.post(`${BASE}/access-tokens/exchange`, {
      data: { token: createdTokenPlain },
      headers: { "Content-Type": "application/json" },
    });
    expect(resp.status()).toBe(401);
  });
});
