import { FC, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { InsertRowLeftOutlined, RightOutlined } from "@ant-design/icons";
import { Button, DatePicker, Space } from "antd";
import dayjs, { Dayjs } from "dayjs";
import styles from "./styles.module.css";

const MONTH_LIST = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

export const DiarySidebar: FC = () => {
  const params = useParams<{ month?: string; date?: string }>();
  /** 页面年份 */
  const [pageYear, setPageYear] = useState<Dayjs | null>(null);
  /** 页面月份 */
  const [pageMonth, setPageMonth] = useState<Dayjs | null>(null);

  useEffect(() => {
    const dateValue = params.month || params.date;
    setPageYear(dayjs(dateValue || undefined));
    setPageMonth(dayjs(dateValue || undefined));
  }, [params.month, params.date]);

  const renderMenuItem = (index: number) => {
    const month = pageYear?.clone().month(index);
    if (month && month.isAfter(dayjs())) return null;

    const label = month?.format("YYYY 年 MM 月");
    const className = [styles.menuItem];
    if (month?.isSame(pageMonth, "month")) {
      className.push(styles.menuItemActive);
    }

    return (
      <Link key={index} to={`/diary/month/${month?.format("YYYYMM")}`}>
        <div className={className.join(" ")} title={label}>
          <span className="truncate">{label}</span>
          <RightOutlined />
        </div>
      </Link>
    );
  };

  return (
    <section className={styles.sidebarBox}>
      <Button className={`${styles.yearPicker} keep-antd-style`}>
        <DatePicker
          picker="year"
          style={{ width: "100%" }}
          bordered={false}
          value={pageYear}
          allowClear={false}
          format="YYYY 年"
          onChange={setPageYear}
        />
      </Button>

      <div className="flex-grow flex-shrink overflow-y-auto noscrollbar overflow-x-hidden my-3">
        <Space direction="vertical" style={{ width: "100%" }}>
          {MONTH_LIST.map(renderMenuItem)}
        </Space>
      </div>

      <Link to={`/diary/month/${dayjs().format("YYYYMM")}`}>
        <Button
          className={`${styles.toolBtn} keep-antd-style`}
          icon={<InsertRowLeftOutlined />}
          block
        >
          返回本月
        </Button>
      </Link>
    </section>
  );
};
