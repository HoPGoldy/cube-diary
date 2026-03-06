import { test, expect, authHeader, BASE } from "../fixtures/api";
import { test as rawTest } from "@playwright/test";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test.describe("Attachment API - 上传与查询", () => {
  test("POST /api/attachments/upload 上传图片", async ({ request, jwt }) => {
    const imagePath = path.join(__dirname, "../assets/test-image.png");
    const imageBuffer = fs.readFileSync(imagePath);

    const resp = await request.post(`${BASE}/attachments/upload`, {
      multipart: {
        file: {
          name: "test-image.png",
          mimeType: "image/png",
          buffer: imageBuffer,
        },
      },
      headers: authHeader(jwt),
    });
    expect(resp.status()).toBe(200);

    const body = await resp.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty("id");
    expect(body.data).toHaveProperty("filename");
    expect(body.data).toHaveProperty("size");
    expect(body.data).toHaveProperty("hash");
    expect(body.data).toHaveProperty("type");
    expect(body.data.type).toBe("image/png");
    expect(typeof body.data.size).toBe("number");
    expect(body.data.size).toBeGreaterThan(0);
  });

  test("POST /api/attachments/info 获取文件信息", async ({ request, jwt }) => {
    // 先上传一个文件
    const imagePath = path.join(__dirname, "../assets/test-image.png");
    const imageBuffer = fs.readFileSync(imagePath);

    const uploadResp = await request.post(`${BASE}/attachments/upload`, {
      multipart: {
        file: {
          name: "info-test.png",
          mimeType: "image/png",
          buffer: imageBuffer,
        },
      },
      headers: authHeader(jwt),
    });
    const uploadBody = await uploadResp.json();
    const fileId = uploadBody.data.id;

    // 查询文件信息
    const resp = await request.post(`${BASE}/attachments/info`, {
      data: { id: fileId },
      headers: authHeader(jwt),
    });
    expect(resp.status()).toBe(200);

    const body = await resp.json();
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(fileId);
    expect(body.data).toHaveProperty("filename");
    expect(body.data).toHaveProperty("size");
    expect(body.data).toHaveProperty("hash");
    expect(body.data).toHaveProperty("type");
    expect(body.data).toHaveProperty("createdAt");
  });

  test("POST /api/attachments/info 不存在的文件返回错误", async ({
    request,
    jwt,
  }) => {
    const resp = await request.post(`${BASE}/attachments/info`, {
      data: { id: "non-existent-file-id" },
      headers: authHeader(jwt),
    });
    // 应返回 404 或错误
    expect(resp.status()).not.toBe(200);
  });

  test("GET /api/attachments/request/:fileId 获取下载链接", async ({
    request,
    jwt,
  }) => {
    // 先上传
    const imagePath = path.join(__dirname, "../assets/test-image.png");
    const imageBuffer = fs.readFileSync(imagePath);

    const uploadResp = await request.post(`${BASE}/attachments/upload`, {
      multipart: {
        file: {
          name: "download-test.png",
          mimeType: "image/png",
          buffer: imageBuffer,
        },
      },
      headers: authHeader(jwt),
    });
    const fileId = (await uploadResp.json()).data.id;

    // 获取下载链接
    const resp = await request.get(`${BASE}/attachments/request/${fileId}`, {
      headers: authHeader(jwt),
    });
    expect(resp.status()).toBe(200);

    const body = await resp.json();
    expect(body.success).toBe(true);
    expect(typeof body.data.url).toBe("string");
    expect(body.data.url).toContain("/api/attachments/download");
    expect(body.data.url).toContain(`i=${fileId}`);
  });

  test("GET /api/attachments/download 使用签名链接下载文件", async ({
    request,
    jwt,
  }) => {
    // 上传 → 获取链接 → 下载
    const imagePath = path.join(__dirname, "../assets/test-image.png");
    const imageBuffer = fs.readFileSync(imagePath);

    const uploadResp = await request.post(`${BASE}/attachments/upload`, {
      multipart: {
        file: {
          name: "signed-download.png",
          mimeType: "image/png",
          buffer: imageBuffer,
        },
      },
      headers: authHeader(jwt),
    });
    const fileId = (await uploadResp.json()).data.id;

    const accessResp = await request.get(
      `${BASE}/attachments/request/${fileId}`,
      {
        headers: authHeader(jwt),
      },
    );
    const downloadUrl = (await accessResp.json()).data.url;

    // 下载（公开接口，无需认证）
    const downloadResp = await request.get(downloadUrl);
    expect(downloadResp.status()).toBe(200);
    expect(downloadResp.headers()["content-type"]).toContain("image/png");

    const downloadBody = await downloadResp.body();
    expect(downloadBody.length).toBeGreaterThan(0);
  });
});

rawTest.describe("Attachment API - 未认证拦截", () => {
  rawTest("未登录上传文件返回 401", async ({ request }) => {
    const resp = await request.post(`${BASE}/attachments/upload`, {
      multipart: {
        file: {
          name: "unauthorized.png",
          mimeType: "image/png",
          buffer: Buffer.from("fake-data"),
        },
      },
    });
    expect(resp.status()).toBe(401);
  });

  rawTest(
    "GET /api/attachments/download 错误签名返回错误",
    async ({ request }) => {
      const resp = await request.get(
        `${BASE}/attachments/download?i=fake-id&t=2025-01&s=wrong-signature`,
      );
      expect(resp.status()).not.toBe(200);
    },
  );
});
