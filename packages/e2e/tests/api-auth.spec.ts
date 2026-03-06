import { test, expect, authHeader, BASE, shaWithSalt } from "../fixtures/api";
import { test as rawTest } from "@playwright/test";

const PASSWORD = process.env.E2E_LOGIN_PASSWORD ?? "admin";

rawTest.describe("Auth API - 公开接口", () => {
  rawTest("POST /api/auth/login 正确密码登录成功", async ({ request }) => {
    const resp = await request.post(`${BASE}/auth/login`, {
      data: { password: shaWithSalt(PASSWORD, "admin") },
    });
    expect(resp.status()).toBe(200);

    const body = await resp.json();
    expect(body.success).toBe(true);
    expect(typeof body.data.token).toBe("string");
    expect(body.data.token.length).toBeGreaterThan(0);
  });

  rawTest("POST /api/auth/login 错误密码返回 401", async ({ request }) => {
    const resp = await request.post(`${BASE}/auth/login`, {
      data: { password: shaWithSalt("wrong-password-definitely", "admin") },
    });
    expect(resp.status()).toBe(401);
  });

  rawTest("POST /api/auth/login 空密码返回错误", async ({ request }) => {
    const resp = await request.post(`${BASE}/auth/login`, {
      data: {},
    });
    expect(resp.status()).not.toBe(200);
  });
});

test.describe("Auth API - 需认证接口", () => {
  test("POST /api/auth/renew 续期 JWT 成功", async ({ request, jwt }) => {
    // 确保 iat 不同（JWT 的 iat 精度为秒）
    await new Promise((r) => setTimeout(r, 1100));
    const resp = await request.post(`${BASE}/auth/renew`, {
      data: {},
      headers: authHeader(jwt),
    });
    expect(resp.status()).toBe(200);

    const body = await resp.json();
    expect(body.success).toBe(true);
    expect(typeof body.data.token).toBe("string");
    expect(body.data.token.length).toBeGreaterThan(0);
    // 新 token 与旧 token 不同
    expect(body.data.token).not.toBe(jwt);
  });

  test("POST /api/auth/renew 续期的 token 可以继续使用", async ({
    request,
    jwt,
  }) => {
    // 先续期
    const renewResp = await request.post(`${BASE}/auth/renew`, {
      data: {},
      headers: authHeader(jwt),
    });
    const newToken = (await renewResp.json()).data.token;

    // 用新 token 访问受保护接口
    const testResp = await request.get(`${BASE}/config/version`, {
      headers: authHeader(newToken),
    });
    expect(testResp.status()).toBe(200);
  });
});

rawTest.describe("Auth API - 未认证拦截", () => {
  rawTest("未携带 token 访问受保护接口返回 401", async ({ request }) => {
    const resp = await request.post(`${BASE}/auth/renew`, {
      data: {},
    });
    expect(resp.status()).toBe(401);
  });

  rawTest("无效 token 访问受保护接口返回 401", async ({ request }) => {
    const resp = await request.post(`${BASE}/auth/renew`, {
      data: {},
      headers: { Authorization: "Bearer invalid-jwt-token" },
    });
    expect(resp.status()).toBe(401);
  });
});
