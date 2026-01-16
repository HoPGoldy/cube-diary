import dayjs from "dayjs";

/**
 * 星期数字到汉字的映射
 */
export const WEEK_TO_CHINESE: Record<number, string> = {
  0: "周日",
  1: "周一",
  2: "周二",
  3: "周三",
  4: "周四",
  5: "周五",
  6: "周六",
};

/**
 * 颜色标记映射
 */
export const MARK_COLORS_MAP: Record<string, string> = {
  red: "#ff4d4f",
  volcano: "#ff7a45",
  orange: "#ffa940",
  gold: "#ffc53d",
  yellow: "#ffec3d",
  lime: "#a0d911",
  green: "#52c41a",
  cyan: "#13c2c2",
  blue: "#1890ff",
  geekblue: "#2f54eb",
  purple: "#722ed1",
  magenta: "#eb2f96",
};

/**
 * 颜色选项列表
 */
export const MARK_COLORS = Object.keys(MARK_COLORS_MAP);

/**
 * 根据日期获取标签文本
 */
export const getLabelByDate = (dateStr: string) => {
  return dayjs(dateStr, "YYYYMMDD").format("MM 月 DD 日 dddd");
};
