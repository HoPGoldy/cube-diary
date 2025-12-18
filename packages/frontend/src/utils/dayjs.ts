import dayjs, { Dayjs } from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";
import localeData from "dayjs/plugin/localeData";
import weekday from "dayjs/plugin/weekday";
import weekOfYear from "dayjs/plugin/weekOfYear";
import weekYear from "dayjs/plugin/weekYear";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/zh-cn";
import "dayjs/locale/en";
import "dayjs/locale/ja";
import { DATE_FORMATTER } from "@/config";

export const initDayjs = () => {
  dayjs.extend(advancedFormat);
  dayjs.extend(customParseFormat);
  dayjs.extend(localeData);
  dayjs.extend(weekday);
  dayjs.extend(weekOfYear);
  dayjs.extend(weekYear);
  dayjs.extend(utc);
  dayjs.extend(timezone);
};

export const utcdayjs = (date?: string | number | Dayjs | Date) => {
  return dayjs.utc(date).tz(dayjs.tz.guess());
};

export const utcdayjsFormat = (
  date?: string | number | Dayjs | Date,
  format = DATE_FORMATTER,
) => {
  return utcdayjs(date).format(format);
};

/** 把 120 转成 2:00 */
export const formatSecondsToMinutesAndSeconds = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};
