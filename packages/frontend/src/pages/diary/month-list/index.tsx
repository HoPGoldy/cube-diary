import { FC, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import { PageContent, PageAction } from "@/layouts/page-with-action";
import { useQueryDiaryList } from "@/services/diary";
import { DiaryListItem } from "./list-item";
import dayjs from "dayjs";
import type { DiaryItem } from "@/services/diary";
import { utcdayjs } from "@/utils/dayjs";

/**
 * 获取指定月份已经过去了多少天
 */
const getMonthExistDate = (monthStr: string) => {
  const monthStart = dayjs(monthStr, "YYYYMM").startOf("M").valueOf();
  const monthEnd = dayjs(monthStr, "YYYYMM").endOf("M");
  const now = dayjs();

  const existDay = monthEnd.isBefore(now) ? monthEnd.date() : now.date();

  const allDates = Array.from({ length: existDay }).map((_, index) => {
    return monthStart + index * 86400000;
  });

  return allDates;
};

/**
 * 日记列表页
 * 一月一页，包含当月所有日记
 */
const MonthList: FC = () => {
  const { month } = useParams<{ month: string }>();
  /** 获取日记列表 */
  const { data: monthListResp, isLoading } = useQueryDiaryList(month);
  /** 列表底部 div 引用 */
  const listBottomRef = useRef<HTMLDivElement>(null);

  const diaryList = useMemo(() => {
    const existList = monthListResp?.data ?? [];
    console.log("🚀 ~ MonthList ~ existList:", existList);
    if (!existList || !month) return [];

    const test = existList.map((diary) => {
      return [utcdayjs(diary.date).format("YYYYMMDD"), diary];
    });
    console.log("🚀 ~ MonthList ~ test:", test);
    const existDiaryMap = new Map(test);
    const allDateList = getMonthExistDate(month);

    const data: Array<DiaryItem | { date: number; undone: true }> =
      allDateList.map((timestamp) => {
        const date = utcdayjs(timestamp).format("YYYYMMDD");
        const existDiary = existDiaryMap.get(date);
        if (existDiary) return existDiary;
        return { date: timestamp, undone: true };
      });

    return data;
  }, [monthListResp, month]);
  console.log("🚀 ~ MonthList ~ diaryList:", diaryList);

  const renderContent = () => {
    if (isLoading) {
      return <div className="p-4 text-center">加载中...</div>;
    }

    return (
      <div className="p-4">
        {diaryList.map((item) => (
          <div key={item.date}>
            <DiaryListItem item={item} />
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <PageContent>
        <div>{renderContent()}</div>
        <div ref={listBottomRef} />
      </PageContent>

      <PageAction>{/* 底部操作栏，后续可以添加新增、搜索等按钮 */}</PageAction>
    </>
  );
};

export default MonthList;
