import { test, expect, authHeader, BASE } from "../fixtures/api";
import { test as rawTest } from "@playwright/test";

test.describe("Access Token API", () => {
  let createdTokenId: string;
  let createdTokenPlain: string;

  test("POST /api/access-tokens 创建令牌", async ({ request, jwt }) => {
    const resp = await request.post(`${BASE}/access-tokens`, {
      data: { name: "api-e2e-test-token" },
      headers: authHeader(jwt),
    });
    expect(resp.status()).toBe(200);

    const body = await resp.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty("id");
    expect(body.data).toHaveProperty("token");
    expect(body.data).toHaveProperty("tokenPrefix");
    expect(body.data.name).toBe("api-e2e-test-token");
    // 明文 token 以 csk- 开头，后接 64 位 hex
    expect(body.data.token).toMatch(/^csk-[0-9a-f]{64}$/);

    createdTokenId = body.data.id;
    createdTokenPlain = body.data.token;
  });

  test("GET /api/access-tokens 列表包含已创建的令牌", async ({
    request,
    jwt,
  }) => {
    const resp = await request.get(`${BASE}/access-tokens`, {
      headers: authHeader(jwt),
    });
    expect(resp.status()).toBe(200);

    const body = await resp.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);

    const found = body.data.find(
      (t: { id: string }) => t.id === createdTokenId,
    );
    expect(found).toBeDefined();
    // 列表不包含 hash 或明文
    expect(found.tokenHash).toBeUndefined();
    expect(found.token).toBeUndefined();
  });

  test("Access Token 可直接作为 Bearer 令牌访问受保护接口", async ({
    request,
  }) => {
    const resp = await request.get(`${BASE}/config/version`, {
      headers: authHeader(createdTokenPlain),
    });
    expect(resp.status()).toBe(200);
  });

  test("无效 Access Token 直接请求返回 401", async ({ request }) => {
    const resp = await request.get(`${BASE}/config/version`, {
      headers: authHeader(
        "csk-0000000000000000000000000000000000000000000000000000000000000000",
      ),
    });
    expect(resp.status()).toBe(401);
  });

  test("DELETE /api/access-tokens/:id 删除令牌", async ({ request, jwt }) => {
    const resp = await request.delete(
      `${BASE}/access-tokens/${createdTokenId}`,
      {
        headers: authHeader(jwt),
      },
    );
    expect(resp.status()).toBe(200);

    const body = await resp.json();
    expect(body.success).toBe(true);
  });

  test("删除后令牌不再出现在列表中", async ({ request, jwt }) => {
    const resp = await request.get(`${BASE}/access-tokens`, {
      headers: authHeader(jwt),
    });
    const body = await resp.json();
    const found = body.data.find(
      (t: { id: string }) => t.id === createdTokenId,
    );
    expect(found).toBeUndefined();
  });

  test("删除后 Access Token 直接请求返回 401", async ({ request }) => {
    const resp = await request.get(`${BASE}/config/version`, {
      headers: authHeader(createdTokenPlain),
    });
    expect(resp.status()).toBe(401);
  });
});

rawTest.describe("Access Token API - 未认证拦截", () => {
  rawTest("未登录创建令牌返回 401", async ({ request }) => {
    const resp = await request.post(`${BASE}/access-tokens`, {
      data: { name: "should-fail" },
    });
    expect(resp.status()).toBe(401);
  });

  rawTest("未登录获取列表返回 401", async ({ request }) => {
    const resp = await request.get(`${BASE}/access-tokens`);
    expect(resp.status()).toBe(401);
  });
});
