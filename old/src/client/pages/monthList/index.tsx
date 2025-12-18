import React, { FC, MouseEventHandler, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageContent, PageAction } from '../../layouts/pageWithAction';
import Loading from '../../layouts/loading';
import { Image } from 'antd';
import { PageTitle } from '@/client/components/pageTitle';
import { useQueryDiaryList } from '@/client/services/diary';
import { DiaryListItem } from './listItem';
import { useOperation } from './operation';
import s from './styles.module.css';
import { useAtomValue } from 'jotai';
import { stateFocusDiaryDate } from '@/client/store/global';
import { useDragPoint } from './useDragPoint';
import { keyBy } from 'lodash';
import dayjs from 'dayjs';
import { DiaryQueryResp } from '@/types/diary';

/**
 * 获取指定月份已经过去了多少天
 *
 * @param monthStr 要查询的月份，值应如 202203
 * @returns 一个数组，值为日期的毫秒时间戳
 */
const getMonthExistDate = (monthStr: string) => {
  const monthStart = dayjs(monthStr, 'YYYYMM').startOf('M').valueOf();
  const monthEnd = dayjs(monthStr, 'YYYYMM').endOf('M');
  const now = dayjs();

  const existDay = monthEnd.isBefore(now) ? monthEnd.date() : now.date();

  const allDates = Array.from({ length: existDay }).map((_, index) => {
    return monthStart + index * 86400000;
  });

  return allDates;
};

/**
 * 日记列表
 * 一月一页，包含当月所有日记
 */
const MonthList: FC = () => {
  const { month } = useParams();
  /** 要跳转到的日记 */
  const focusDate = useAtomValue(stateFocusDiaryDate);
  /** 获取日记列表 */
  const { data: monthListResp, isLoading } = useQueryDiaryList(month);
  /** 当前正在预览的图片链接 */
  const [visibleImgSrc, setVisibleImgSrc] = useState('');
  /** 底部操作栏 */
  const { renderMobileBar } = useOperation();
  /** 列表底部 div 引用 */
  const listBottomRef = useRef<HTMLDivElement>(null);

  /** 上下月切换功能 */
  const { renderBottomPoint, renderTopPoint, listListener } = useDragPoint({ month });

  const onClickDetail: MouseEventHandler<HTMLDivElement> = (e) => {
    const target = e.target as HTMLImageElement;
    if (target?.tagName === 'IMG') {
      setVisibleImgSrc(target.src);
    }
  };

  const diaryList = useMemo(() => {
    const existList = monthListResp?.data ?? [];
    if (!existList || !month) return [];

    const existDiaryEnums = keyBy(existList, (diary) => dayjs(diary.date).format('YYYYMMDD'));
    const allDateList = getMonthExistDate(month);

    const data: DiaryQueryResp = allDateList.map((timestamp) => {
      const date = dayjs(timestamp).format('YYYYMMDD');
      if (date in existDiaryEnums) return existDiaryEnums[date];
      return { date: timestamp, undone: true };
    });

    return data;
  }, [monthListResp, month]);

  const renderContent = () => {
    if (isLoading) return <Loading />;

    return (
      <div className={s.listContainer}>
        {diaryList.map((item) => (
          <div data-diary-date={item.date} key={item.date}>
            <DiaryListItem item={item} />
          </div>
        ))}
      </div>
    );
  };

  useEffect(() => {
    if (!focusDate) {
      listBottomRef.current?.scrollIntoView();
      return;
    }

    const targetDiv = document.querySelector(`[data-diary-date='${focusDate}']`);
    if (targetDiv) targetDiv.scrollIntoView();
  }, [monthListResp]);

  return (
    <>
      <PageTitle title='日记列表' />

      <PageContent>
        <div className='mx-4 mt-4 relative' onClick={onClickDetail} {...listListener}>
          {renderTopPoint()}
          {renderContent()}
          {renderBottomPoint()}
        </div>
        <div ref={listBottomRef}></div>
        <Image
          preview={{
            visible: !!visibleImgSrc,
            src: visibleImgSrc,
            onVisibleChange: () => setVisibleImgSrc(''),
          }}
        />
      </PageContent>

      <PageAction>{renderMobileBar()}</PageAction>
    </>
  );
};

export default MonthList;
