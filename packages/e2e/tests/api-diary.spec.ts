import { test, expect, authHeader, BASE } from "../fixtures/api";
import dayjs from "dayjs";

const TODAY = dayjs().format("YYYYMMDD");
const THIS_MONTH = dayjs().format("YYYYMM");
const TODAY_DATE_UTC0 = dayjs(dayjs().format("YYYY-MM-DD")).valueOf(); // UTC 0 毫秒时间戳

test.describe("Diary API - 日记增删改查", () => {
  test("POST /api/diary/update 新增/更新日记", async ({ request, jwt }) => {
    const resp = await request.post(`${BASE}/diary/update`, {
      data: {
        dateStr: TODAY,
        date: TODAY_DATE_UTC0,
        content: "# E2E API 测试日记\n\n这是一条纯 API 测试写入的日记。",
        color: "#ff5500",
      },
      headers: authHeader(jwt),
    });
    expect(resp.status()).toBe(200);

    const body = await resp.json();
    expect(body.success).toBe(true);
  });

  test("POST /api/diary/get-detail 获取日记详情", async ({ request, jwt }) => {
    // 先写入
    await request.post(`${BASE}/diary/update`, {
      data: {
        dateStr: TODAY,
        date: TODAY_DATE_UTC0,
        content: "详情测试内容",
      },
      headers: authHeader(jwt),
    });

    // 再读取
    const resp = await request.post(`${BASE}/diary/get-detail`, {
      data: { dateStr: TODAY },
      headers: authHeader(jwt),
    });
    expect(resp.status()).toBe(200);

    const body = await resp.json();
    expect(body.success).toBe(true);
    expect(body.data.content).toBe("详情测试内容");
  });

  test("POST /api/diary/get-detail 不存在的日期返回空内容", async ({
    request,
    jwt,
  }) => {
    const resp = await request.post(`${BASE}/diary/get-detail`, {
      data: { dateStr: "19000101" },
      headers: authHeader(jwt),
    });
    expect(resp.status()).toBe(200);

    const body = await resp.json();
    expect(body.success).toBe(true);
    expect(body.data.content).toBe("");
  });

  test("POST /api/diary/update 只更新颜色标签", async ({ request, jwt }) => {
    const resp = await request.post(`${BASE}/diary/update`, {
      data: {
        dateStr: TODAY,
        date: TODAY_DATE_UTC0,
        color: "#00cc66",
      },
      headers: authHeader(jwt),
    });
    expect(resp.status()).toBe(200);
  });

  test("POST /api/diary/update 清除颜色标签", async ({ request, jwt }) => {
    const resp = await request.post(`${BASE}/diary/update`, {
      data: {
        dateStr: TODAY,
        date: TODAY_DATE_UTC0,
        color: null,
      },
      headers: authHeader(jwt),
    });
    expect(resp.status()).toBe(200);
  });

  test("POST /api/diary/get-month-list 获取月份日记列表", async ({
    request,
    jwt,
  }) => {
    // 确保本月有数据
    await request.post(`${BASE}/diary/update`, {
      data: {
        dateStr: TODAY,
        date: TODAY_DATE_UTC0,
        content: "月份列表测试",
      },
      headers: authHeader(jwt),
    });

    const resp = await request.post(`${BASE}/diary/get-month-list`, {
      data: { month: THIS_MONTH },
      headers: authHeader(jwt),
    });
    expect(resp.status()).toBe(200);

    const body = await resp.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);

    // 至少包含刚写入的日记
    const todayEntry = body.data.find(
      (d: { dateStr: string }) => d.dateStr === TODAY,
    );
    expect(todayEntry).toBeDefined();
    expect(todayEntry.content).toBeTruthy();
  });
});

test.describe("Diary API - 搜索", () => {
  test("POST /api/diary/search 按关键字搜索", async ({ request, jwt }) => {
    // 先写入一条有特殊关键字的日记
    const keyword = `e2e_api_search_${Date.now()}`;
    await request.post(`${BASE}/diary/update`, {
      data: {
        dateStr: TODAY,
        date: TODAY_DATE_UTC0,
        content: `搜索测试：${keyword}`,
      },
      headers: authHeader(jwt),
    });

    const resp = await request.post(`${BASE}/diary/search`, {
      data: { keyword },
      headers: authHeader(jwt),
    });
    expect(resp.status()).toBe(200);

    const body = await resp.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty("total");
    expect(body.data).toHaveProperty("rows");
    expect(body.data.total).toBeGreaterThanOrEqual(1);
    expect(body.data.rows[0].content).toContain(keyword);
  });

  test("POST /api/diary/search 空关键字返回全部（分页）", async ({
    request,
    jwt,
  }) => {
    const resp = await request.post(`${BASE}/diary/search`, {
      data: { keyword: "" },
      headers: authHeader(jwt),
    });
    expect(resp.status()).toBe(200);

    const body = await resp.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty("total");
    expect(Array.isArray(body.data.rows)).toBe(true);
  });

  test("POST /api/diary/search 按颜色筛选", async ({ request, jwt }) => {
    const resp = await request.post(`${BASE}/diary/search`, {
      data: { colors: ["#ff5500"] },
      headers: authHeader(jwt),
    });
    expect(resp.status()).toBe(200);

    const body = await resp.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty("rows");
  });

  test("POST /api/diary/search 分页参数生效", async ({ request, jwt }) => {
    const resp = await request.post(`${BASE}/diary/search`, {
      data: { keyword: "", page: 1, pageSize: 2 },
      headers: authHeader(jwt),
    });
    expect(resp.status()).toBe(200);

    const body = await resp.json();
    expect(body.data.rows.length).toBeLessThanOrEqual(2);
  });

  test("POST /api/diary/search 倒序排列", async ({ request, jwt }) => {
    const resp = await request.post(`${BASE}/diary/search`, {
      data: { keyword: "", desc: true },
      headers: authHeader(jwt),
    });
    expect(resp.status()).toBe(200);

    const body = await resp.json();
    if (body.data.rows.length >= 2) {
      // date 字段降序
      expect(Number(body.data.rows[0].date)).toBeGreaterThanOrEqual(
        Number(body.data.rows[1].date),
      );
    }
  });
});

test.describe("Diary API - 统计", () => {
  test("POST /api/diary/statistic 返回统计数据", async ({ request, jwt }) => {
    const resp = await request.post(`${BASE}/diary/statistic`, {
      data: {},
      headers: authHeader(jwt),
    });
    expect(resp.status()).toBe(200);

    const body = await resp.json();
    expect(body.success).toBe(true);
    expect(typeof body.data.diaryCount).toBe("number");
    expect(typeof body.data.diaryLength).toBe("number");
    expect(body.data.diaryCount).toBeGreaterThanOrEqual(0);
    expect(body.data.diaryLength).toBeGreaterThanOrEqual(0);
  });
});

test.describe("Diary API - 导出", () => {
  test("POST /api/diary/export 导出全部日记", async ({ request, jwt }) => {
    const resp = await request.post(`${BASE}/diary/export`, {
      data: {
        range: "all",
        dateKey: "date",
        dateFormatter: "YYYY-MM-DD",
        contentKey: "content",
        colorKey: "color",
      },
      headers: authHeader(jwt),
    });
    expect(resp.status()).toBe(200);

    const body = await resp.json();
    // 导出结果是 JSON 数组
    expect(Array.isArray(body.data || body)).toBe(true);
  });

  test("POST /api/diary/export 按范围导出日记", async ({ request, jwt }) => {
    const startDate = dayjs().startOf("month").valueOf();
    const endDate = dayjs().endOf("month").valueOf();

    const resp = await request.post(`${BASE}/diary/export`, {
      data: {
        range: "part",
        startDate,
        endDate,
        dateKey: "date",
        dateFormatter: "YYYY-MM-DD",
        contentKey: "content",
        colorKey: "color",
      },
      headers: authHeader(jwt),
    });
    expect(resp.status()).toBe(200);
  });
});

test.describe("Diary API - 导入", () => {
  test("POST /api/diary/import 导入日记 JSON", async ({ request, jwt }) => {
    const importData = [
      {
        date: "2020-01-01",
        content: "E2E 导入测试日记",
        color: null,
      },
    ];
    const fileBuffer = Buffer.from(JSON.stringify(importData));

    const config = JSON.stringify({
      existOperation: "skip",
      dateKey: "date",
      dateFormatter: "YYYY-MM-DD",
      contentKey: "content",
      colorKey: "color",
    });

    const resp = await request.post(`${BASE}/diary/import`, {
      multipart: {
        file: {
          name: "import.json",
          mimeType: "application/json",
          buffer: fileBuffer,
        },
        config,
      },
      headers: authHeader(jwt),
    });
    expect(resp.status()).toBe(200);

    const body = await resp.json();
    expect(body.success).toBe(true);
    expect(typeof body.data.insertCount).toBe("number");
    expect(typeof body.data.updateCount).toBe("number");
  });
});
