import { test, expect, authHeader, BASE } from "../fixtures/api";
import { test as rawTest } from "@playwright/test";

test.describe("Config API", () => {
  test("GET /api/config/version 获取版本信息", async ({ request, jwt }) => {
    const resp = await request.get(`${BASE}/config/version`, {
      headers: authHeader(jwt),
    });
    expect(resp.status()).toBe(200);

    const body = await resp.json();
    expect(body.success).toBe(true);
    expect(typeof body.data.version).toBe("string");
    expect(typeof body.data.name).toBe("string");
    // 版本号格式: x.y.z
    expect(body.data.version).toMatch(/^\d+\.\d+\.\d+/);
    // repository 字段存在
    expect(body.data.repository).toBeDefined();
  });

  test("GET /api/config/version 不应返回模块导入错误", async ({
    request,
    jwt,
  }) => {
    const resp = await request.get(`${BASE}/config/version`, {
      headers: authHeader(jwt),
    });
    const body = await resp.json();
    expect(body.success).toBe(true);
    expect(body.code).toBe(200);
    // 确保没有 ERR_IMPORT_ASSERTION_TYPE_MISSING 错误
    expect(body.message).toBeUndefined();
  });

  test("POST /api/config 获取配置列表", async ({ request, jwt }) => {
    const resp = await request.post(`${BASE}/config`, {
      data: {},
      headers: authHeader(jwt),
    });
    expect(resp.status()).toBe(200);

    const body = await resp.json();
    expect(body.success).toBe(true);
    expect(typeof body.data).toBe("object");
  });

  test("POST /api/config/update 更新配置", async ({ request, jwt }) => {
    const resp = await request.post(`${BASE}/config/update`, {
      data: { e2eTestKey: "e2e-test-value" },
      headers: authHeader(jwt),
    });
    expect(resp.status()).toBe(200);

    const body = await resp.json();
    expect(body.success).toBe(true);
  });

  test("更新后配置值生效", async ({ request, jwt }) => {
    // 先更新
    await request.post(`${BASE}/config/update`, {
      data: { e2eVerifyKey: "verify-value" },
      headers: authHeader(jwt),
    });

    // 再读取
    const resp = await request.post(`${BASE}/config`, {
      data: {},
      headers: authHeader(jwt),
    });
    const body = await resp.json();
    expect(body.data.e2eVerifyKey).toBe("verify-value");
  });
});

rawTest.describe("Config API - 权限控制", () => {
  rawTest("未登录获取配置返回 401", async ({ request }) => {
    const resp = await request.post(`${BASE}/config`, { data: {} });
    expect(resp.status()).toBe(401);
  });

  rawTest("未登录更新配置返回 401", async ({ request }) => {
    const resp = await request.post(`${BASE}/config/update`, {
      data: { key: "value" },
    });
    expect(resp.status()).toBe(401);
  });

  rawTest("未登录获取版本信息返回 401", async ({ request }) => {
    const resp = await request.get(`${BASE}/config/version`);
    expect(resp.status()).toBe(401);
  });
});
