import { Flex, FlexProps, Modal } from "antd";
import { FC } from "react";
import s from "./styles.module.css";
import { MARK_COLORS_WITH_EMPTY, MARK_COLORS_MAP } from "./constants";

interface ColorItemProps {
  colorCode: string;
  selected: boolean;
  onClick: (colorCode: string) => void;
}

const ColorItem: FC<ColorItemProps> = (props) => {
  const { colorCode, selected, onClick } = props;

  const classes = [s.colorBtn, "m-auto"];
  if (selected) classes.push(s.selectedColor);
  if (colorCode === "") classes.push(s.removeBtn);

  return (
    <div
      className={classes.join(" ")}
      style={{ backgroundColor: MARK_COLORS_MAP[colorCode] }}
      onClick={() => onClick(colorCode)}
    />
  );
};

interface ColorListProps {
  value?: string;
  onChange?: (value: string) => void;
  flexProps?: Omit<FlexProps, "children">;
}

export const ColorList: FC<ColorListProps> = (props) => {
  const { value, onChange } = props;

  const renderMarkColor = (colorCode: string) => {
    return (
      <ColorItem
        key={colorCode}
        colorCode={colorCode}
        selected={value === colorCode}
        onClick={() => {
          onChange?.(colorCode || "");
        }}
      />
    );
  };

  return (
    <Flex wrap gap={8} {...props.flexProps}>
      {MARK_COLORS_WITH_EMPTY.map(renderMarkColor)}
    </Flex>
  );
};

interface ColorPickerProps {
  value?: string;
  onChange?: (value: string) => void;
  visible: boolean;
  onClose: () => void;
}

export const ColorPicker: FC<ColorPickerProps> = (props) => {
  const { value, onChange, visible, onClose } = props;

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      closable={false}
      styles={{ body: { padding: 24 } }}
    >
      <ColorList
        value={value}
        onChange={onChange}
        flexProps={{ gap: 48, justify: "center" }}
      />
    </Modal>
  );
};
