import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ActionButton, ActionIcon } from '@/client/layouts/pageWithAction';
import { messageWarning } from '@/client/utils/message';
import {
  SettingOutlined,
  SearchOutlined,
  CalendarOutlined,
  LeftOutlined,
  RightOutlined,
  DoubleLeftOutlined,
  DoubleRightOutlined,
} from '@ant-design/icons';
import { MobileSetting } from '../setting';
import s from './styles.module.css';
import { Button, Col, Drawer, Input, Row } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { MobileDrawer } from '@/client/components/mobileDrawer';

/**
 * 生成日记编辑的跳转链接
 * @param datetime 要跳转到的日期 UNIX 时间戳
 */
export const getDiaryWriteUrl = (datetime?: number) => {
  const queryDate = typeof datetime === 'number' ? dayjs(datetime) : dayjs();
  return `/diary/${queryDate.format('YYYYMMDD')}`;
};

const MONTH_LIST = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

const SETTING_PARAM_KEY = 'showSetting';

export const useOperation = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  /** 是否展示设置 */
  const settingVisible = searchParams.get(SETTING_PARAM_KEY) === '1';
  /** 是否显示月份选择器 */
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  /** 当前年份 */
  const [currentYear, setCurrentYear] = useState(dayjs(params.month).year());
  /** 当前显示的月份列表 */
  const [currentMonthList, setCurrentMonthList] = useState<Dayjs[]>([]);

  const showSetting = () => {
    searchParams.set(SETTING_PARAM_KEY, '1');
    setSearchParams(searchParams);
  };

  const closeSetting = () => {
    searchParams.delete(SETTING_PARAM_KEY);
    setSearchParams(searchParams, { replace: true });
  };

  useEffect(() => {
    setCurrentYear(dayjs(params.month).year());
  }, [params.month, showMonthPicker]);

  useEffect(() => {
    const year = +currentYear;
    const monthList = MONTH_LIST.map((month) => dayjs().year(year).month(month));
    setCurrentMonthList(monthList);
  }, [currentYear]);

  const onClickWrite = (datetime?: number) => {
    navigate(getDiaryWriteUrl(datetime));
  };

  /** 跳转到指定月份 */
  const jumpToMonth = (date: Dayjs) => {
    if (date.valueOf() > dayjs().valueOf()) {
      messageWarning('不能跳转到未来的月份');
      return;
    }

    navigate(`/month/${date.format('YYYYMM')}`);
    setShowMonthPicker(false);
  };

  /** 跳转到上个月 */
  const jumpToPrevMonth = () => {
    const prevMonth = dayjs(params.month).subtract(1, 'month');
    navigate(`/month/${prevMonth.format('YYYYMM')}`);
    setShowMonthPicker(false);
  };

  /** 跳转到下个月 */
  const jumpToNextMonth = () => {
    const nextMonth = dayjs(params.month).add(1, 'month');
    if (nextMonth.valueOf() > dayjs().valueOf()) {
      messageWarning('不能跳转到未来的月份');
      return;
    }

    navigate(`/month/${nextMonth.format('YYYYMM')}`);
    setShowMonthPicker(false);
  };

  /** 渲染月份选择器条目 */
  const renderMonthPickerItem = (date: Dayjs) => {
    const className = [s.monthPickerItem];
    if (date.valueOf() > dayjs().valueOf()) {
      className.push(s.monthPickerItemDisabled);
    } else if (date.format('YYYYMM') === params.month) {
      className.push(s.monthPickerItemActive);
    }

    return (
      <Col span={8} key={date.month()}>
        <div className={className.join(' ')} onClick={() => jumpToMonth(date)}>
          {date.month() + 1} 月
        </div>
      </Col>
    );
  };

  /** 渲染月份选择器 */
  const renderMonthPicker = () => {
    return (
      <MobileDrawer
        title={dayjs(params.month).format('YYYY 年 MM 月')}
        open={showMonthPicker}
        onClose={() => setShowMonthPicker(false)}
        height='16.5rem'
        footer={
          <div className='flex flex-row flex-nowrap items-center'>
            <div className='mr-2'>
              <Button
                icon={<DoubleLeftOutlined />}
                onClick={() => setCurrentYear(+currentYear - 1)}
                size='large'></Button>
            </div>
            <div className='mr-2'>
              <Button icon={<LeftOutlined />} onClick={jumpToPrevMonth} size='large'></Button>
            </div>
            <div className='flex-1 mr-2'>
              <Input
                value={currentYear}
                onInput={(e: any) => setCurrentYear(e.target.value)}
                bordered={false}
                className='text-center w-full text-base font-blod'></Input>
            </div>
            <div className='mr-2'>
              <Button icon={<RightOutlined />} onClick={jumpToNextMonth} size='large'></Button>
            </div>
            <div>
              <Button
                icon={<DoubleRightOutlined />}
                onClick={() => setCurrentYear(+currentYear + 1)}
                size='large'></Button>
            </div>
          </div>
        }>
        <Row gutter={[8, 8]}>{currentMonthList.map(renderMonthPickerItem)}</Row>
      </MobileDrawer>
    );
  };

  /** 渲染移动端的底部操作栏 */
  const renderMobileBar = () => {
    return (
      <>
        {renderMonthPicker()}
        <Drawer
          open={settingVisible}
          onClose={closeSetting}
          closable={false}
          placement='left'
          className={s.settingDrawer}
          width='100%'>
          <MobileSetting onBack={closeSetting} />
        </Drawer>
        <ActionIcon icon={<SettingOutlined />} onClick={showSetting} />
        <ActionIcon icon={<CalendarOutlined />} onClick={() => setShowMonthPicker(true)} />
        <Link to='/search'>
          <ActionIcon icon={<SearchOutlined />} />
        </Link>
        <ActionButton onClick={() => onClickWrite()}>写点什么</ActionButton>
      </>
    );
  };

  return {
    renderMobileBar,
  };
};
