import { test as base, expect, type APIRequestContext } from "@playwright/test";
import crypto from "crypto";

const LOGIN_PASSWORD = process.env.E2E_LOGIN_PASSWORD ?? "admin";
const BASE = "/api";

/**
 * 与前后端保持一致的加盐 SHA-512
 */
export const shaWithSalt = (str: string, saltValue: string): string => {
  const salt = crypto.createHash("sha512").update(saltValue).digest("hex");
  const hash = crypto
    .createHash("sha512")
    .update(salt + str)
    .digest("hex");
  return hash.toUpperCase();
};

/**
 * 通过 API 登录获取 JWT，供纯 API 测试使用（无需浏览器）
 */
async function loginViaApi(request: APIRequestContext): Promise<string> {
  const resp = await request.post(`${BASE}/auth/login`, {
    data: { password: shaWithSalt(LOGIN_PASSWORD, "admin") },
  });
  const body = await resp.json();
  expect(body.success).toBe(true);
  return body.data.token as string;
}

/**
 * 构建 Bearer 认证 header
 */
function authHeader(jwt: string) {
  return { Authorization: `Bearer ${jwt}` };
}

interface ApiFixtures {
  /** 已认证的 JWT token */
  jwt: string;
}

/**
 * 纯 API 测试 fixture
 * 提供自动登录后的 jwt，搭配 request 使用
 */
export const test = base.extend<ApiFixtures>({
  jwt: async ({ request }, use) => {
    const token = await loginViaApi(request);
    await use(token);
  },
});

export { expect, authHeader, BASE };
