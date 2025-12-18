import { Card } from "antd";
import React from "react";

// 根据在线率返回颜色
export const getUptimeColor = (uptimePercentage: number | null | undefined) => {
  if (uptimePercentage === undefined || uptimePercentage === null)
    return "text-gray-400";
  if (uptimePercentage >= 99) return "text-green-500";
  if (uptimePercentage >= 95) return "text-yellow-500";
  return "text-red-500";
};

interface StatCardProps {
  label: string;
  subLabel?: string;
  value: string | number | null;
  unit?: string;
  colorClass?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  subLabel,
  value,
  unit = "",
  colorClass = "",
}) => (
  <Card className="flex-grow flex-shrink-0" styles={{ body: { padding: 12 } }}>
    <div className="text-center min-w-[80px]">
      <div className="text-base text-gray-400">{label}</div>
      {subLabel && <div className="text-xs text-gray-400">({subLabel})</div>}
      <div className={`text-lg mt-2 font-semibold ${colorClass}`}>
        {value !== null ? `${value}${unit}` : "-"}
      </div>
    </div>
  </Card>
);
