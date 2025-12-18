import { FC } from "react";
import { MARK_COLORS_MAP } from "./constants";

interface ColorDotProps {
  color: string;
  className?: string;
}

export const getColorValue = (color: string) => {
  if (color in MARK_COLORS_MAP) {
    return MARK_COLORS_MAP[color];
  }

  return color;
};

export const ColorDot: FC<ColorDotProps> = (props) => {
  if (!props.color) {
    return <></>;
  }

  return (
    <div
      className={`flex-shrink-0 w-3 h-3 rounded ${props.className || ""}`}
      style={{ backgroundColor: getColorValue(props.color) }}
    />
  );
};
