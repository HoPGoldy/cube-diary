import { FC, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ActionButton, ActionIcon } from "@/layouts/page-with-action";
import { messageWarning } from "@/utils/message";
import {
  SettingOutlined,
  SearchOutlined,
  CalendarOutlined,
  LeftOutlined,
  RightOutlined,
  DoubleLeftOutlined,
  DoubleRightOutlined,
} from "@ant-design/icons";
import s from "./styles.module.css";
import { Button, Col, Input, Row } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { MobileDrawer } from "@/components/mobile-drawer";

/**
 * 生成日记编辑的跳转链接
 * @param datetime 要跳转到的日期 UNIX 时间戳
 */
export const getDiaryWriteUrl = (datetime?: number) => {
  const queryDate = typeof datetime === "number" ? dayjs(datetime) : dayjs();
  return `/diary/${queryDate.format("YYYYMMDD")}`;
};

const MONTH_LIST = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

interface OperationProps {
  onShowSetting?: () => void;
}

/**
 * 移动端底部操作栏
 */
export const Operation: FC<OperationProps> = (props) => {
  const { onShowSetting } = props;
  const params = useParams();
  const navigate = useNavigate();
  /** 是否显示月份选择器 */
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  /** 当前年份 */
  const [currentYear, setCurrentYear] = useState(dayjs(params.month).year());
  /** 当前显示的月份列表 */
  const [currentMonthList, setCurrentMonthList] = useState<Dayjs[]>([]);

  useEffect(() => {
    setCurrentYear(dayjs(params.month).year());
  }, [params.month, showMonthPicker]);

  useEffect(() => {
    const year = +currentYear;
    const monthList = MONTH_LIST.map((month) =>
      dayjs().year(year).month(month),
    );
    setCurrentMonthList(monthList);
  }, [currentYear]);

  const onClickWrite = (datetime?: number) => {
    navigate(getDiaryWriteUrl(datetime));
  };

  /** 跳转到指定月份 */
  const jumpToMonth = (date: Dayjs) => {
    if (date.valueOf() > dayjs().valueOf()) {
      messageWarning("不能跳转到未来的月份");
      return;
    }

    navigate(`/month/${date.format("YYYYMM")}`);
    setShowMonthPicker(false);
  };

  /** 跳转到上个月 */
  const jumpToPrevMonth = () => {
    const prevMonth = dayjs(params.month).subtract(1, "month");
    navigate(`/month/${prevMonth.format("YYYYMM")}`);
    setShowMonthPicker(false);
  };

  /** 跳转到下个月 */
  const jumpToNextMonth = () => {
    const nextMonth = dayjs(params.month).add(1, "month");
    if (nextMonth.valueOf() > dayjs().valueOf()) {
      messageWarning("不能跳转到未来的月份");
      return;
    }

    navigate(`/month/${nextMonth.format("YYYYMM")}`);
    setShowMonthPicker(false);
  };

  /** 渲染月份选择器条目 */
  const renderMonthPickerItem = (date: Dayjs) => {
    const className = [s.monthPickerItem];
    if (date.valueOf() > dayjs().valueOf()) {
      className.push(s.monthPickerItemDisabled);
    } else if (date.format("YYYYMM") === params.month) {
      className.push(s.monthPickerItemActive);
    }

    return (
      <Col span={8} key={date.month()}>
        <div className={className.join(" ")} onClick={() => jumpToMonth(date)}>
          {date.month() + 1} 月
        </div>
      </Col>
    );
  };

  /** 渲染月份选择器 */
  const renderMonthPicker = () => {
    return (
      <MobileDrawer
        title={dayjs(params.month).format("YYYY 年 MM 月")}
        open={showMonthPicker}
        onClose={() => setShowMonthPicker(false)}
        height="16.5rem"
        footer={
          <div className="flex flex-row flex-nowrap items-center">
            <div className="mr-2">
              <Button
                icon={<DoubleLeftOutlined />}
                onClick={() => setCurrentYear(+currentYear - 1)}
                size="large"
              />
            </div>
            <div className="mr-2">
              <Button
                icon={<LeftOutlined />}
                onClick={jumpToPrevMonth}
                size="large"
              />
            </div>
            <div className="flex-1 mr-2">
              <Input
                value={currentYear}
                onChange={(e) => setCurrentYear(+e.target.value)}
                className="text-center w-full text-base font-bold"
                variant="borderless"
              />
            </div>
            <div className="mr-2">
              <Button
                icon={<RightOutlined />}
                onClick={jumpToNextMonth}
                size="large"
              />
            </div>
            <div>
              <Button
                icon={<DoubleRightOutlined />}
                onClick={() => setCurrentYear(+currentYear + 1)}
                size="large"
              />
            </div>
          </div>
        }
      >
        <Row gutter={[8, 8]}>{currentMonthList.map(renderMonthPickerItem)}</Row>
      </MobileDrawer>
    );
  };

  return (
    <>
      {renderMonthPicker()}
      {onShowSetting && (
        <ActionIcon icon={<SettingOutlined />} onClick={onShowSetting} />
      )}
      <ActionIcon
        icon={<CalendarOutlined />}
        onClick={() => setShowMonthPicker(true)}
      />
      <Link to="/diary/search">
        <ActionIcon icon={<SearchOutlined />} />
      </Link>
      <ActionButton onClick={() => onClickWrite()}>写点什么</ActionButton>
    </>
  );
};
