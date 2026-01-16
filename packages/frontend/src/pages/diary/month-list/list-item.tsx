import { MarkdownPreview } from "@/components/markdown-editor";
import { Card } from "antd";
import { FC } from "react";
import { useNavigate } from "react-router-dom";
import { getLabelByDate, MARK_COLORS_MAP } from "../constants";
import type { DiaryItem } from "@/services/diary";
import styles from "./styles.module.css";
import { utcdayjsFormat } from "@/utils/dayjs";

interface Props {
  item: DiaryItem | { date: number; undone: true };
}

/**
 * 日记列表项组件
 */
export const DiaryListItem: FC<Props> = ({ item }) => {
  const navigate = useNavigate();

  const title = getLabelByDate(item.date);

  const onEdit = () => {
    const dateStr = utcdayjsFormat(item.date, "YYYYMMDD");
    navigate(`/diary/${dateStr}`);
  };

  if ("undone" in item) {
    return (
      <Card size="small" onClick={onEdit} className={styles.listItem}>
        <div className="text-gray-400 font-bold cursor-pointer">{title}</div>
      </Card>
    );
  }

  return (
    <Card
      title={
        <div
          className="text-gray-400 font-bold cursor-pointer"
          onClick={onEdit}
        >
          {title}
        </div>
      }
      className={styles.listItem}
      size="small"
      extra={
        item.color && (
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: MARK_COLORS_MAP[item.color] }}
          />
        )
      }
    >
      <div className={`w-full ${styles.mdArea}`}>
        <MarkdownPreview source={item.content} />
      </div>
    </Card>
  );
};
