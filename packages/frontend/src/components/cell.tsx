import { Flex } from "antd";
import React, { FC } from "react";

export interface CellProps {
  className?: string;
  title: string | React.ReactNode;
  extra?: string | React.ReactNode;
  onClick?: () => void;
}

export const Cell: FC<CellProps> = (props) => {
  return (
    <Flex
      justify="space-between"
      align="center"
      onClick={props.onClick}
      className={`min-h-12 ${props.className || ""}`}
    >
      <span className="text-base">{props.title}</span>
      <span className="text-base">{props.extra}</span>
    </Flex>
  );
};

export const SplitLine: FC = () => {
  return (
    <div
      className="w-full bg-gray-200 dark:bg-neutral-500"
      style={{ height: 1 }}
    ></div>
  );
};
