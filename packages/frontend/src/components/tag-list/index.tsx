import React from "react";
import { Tag } from "antd";

interface TagListProps {
  tags: string;
}

export const TagList: React.FC<TagListProps> = ({ tags }) => {
  // 将逗号分隔的标签字符串转换为数组
  const tagArray = tags
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag);

  if (tagArray.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tagArray.map((tag, index) => (
        <Tag key={index} color="blue">
          {tag}
        </Tag>
      ))}
    </div>
  );
};
