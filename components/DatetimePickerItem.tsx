import dayjs from "dayjs";
import { useState } from "react";
import { FormItemProps, Field, Popup, DatetimePicker } from "react-vant";

export type CustomItemProps = {
    value?: any;
    onChange?: (v: any) => void;
    placeholder?: string;
} & FormItemProps;

/**
 * 字段 Cell 占位 + 弹出框 + 日期选择器组件
 */
export const DatetimePickerItem = function (props: CustomItemProps) {
    const { value, onChange, ...fieldProps } = props;
    const [visible, setVisible] = useState(false);

    const onShow = () => {
        setVisible(true);
    };
    const onCancel = () => {
        setVisible(false);
    };
    const onConfirm = (val: Date) => {
        onChange && onChange(dayjs(val).format('YYYY-MM-DD'));
        onCancel();
    };
    return (
        <>
            <Field isLink readonly {...fieldProps} value={value} onClick={onShow} />
            <Popup position="bottom" round visible={visible} onClose={onCancel}>
                <DatetimePicker
                    title="选择年月日"
                    type="date"
                    minDate={new Date(2020, 0, 1)}
                    maxDate={new Date(2025, 10, 1)}
                    value={new Date(value)}
                    formatter={(type: string, val: string) => {
                        if (type === 'year') return `${val} 年`
                        if (type === 'month') return `${val} 月`
                        return `${val} 日`
                    }}
                    onCancel={onCancel}
                    onConfirm={onConfirm}
                />
            </Popup>
        </>
    );
}