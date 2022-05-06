import dayjs from 'dayjs'
import router from 'next/router'
import { FC, useRef, useState } from 'react'
import { Popup, DatetimePicker, DateTimePickerInstance } from 'react-vant'

interface Props {
    visible: boolean
    onClose: () => unknown
}

/**
 * 日记列表下的日期选择弹窗
 */
export const MonthPicker: FC<Props> = (props) => {
    const { visible, onClose } = props

    const datePickerRef = useRef<DateTimePickerInstance>(null)

    // 日期选择框的相关数据，防止额外渲染
    // https://3lang3.github.io/react-vant/#/zh-CN/datetime-picker#%E8%AE%BE%E7%BD%AE-mindate-%E6%88%96-maxdate-%E5%90%8E%E5%87%BA%E7%8E%B0%E9%A1%B5%E9%9D%A2%E5%8D%A1%E6%AD%BB%E7%9A%84%E6%83%85%E5%86%B5
    const [dateValue] = useState<{ value: Date, maxDate: Date }>(() => ({
        value: dayjs(router.query.month as string).toDate(),
        maxDate: new Date()
    }))

    const onChoseMonth = () => {
        // 这里加延迟的原因是：react-vant 的值变更是在滚动结束时发生的
        // 所以如果用户手速太快，在滚动结束之前就点击了确定，就无法获取到最新的值
        setTimeout(() => {
            const date = datePickerRef.current?.getPicker().getValues<string>()
            if (!date) return

            const newQueryMonth = date[0].replace(' 年', '') + date[1].replace(' 月', '')
            router.push(`/diary/${newQueryMonth}`)
            onClose()
        }, 400)
    }

    return (
        <Popup
            round
            visible={visible}
            position="bottom"
            onClose={onClose}
        >
            <DatetimePicker 
                ref={datePickerRef}
                swipeDuration={300}
                className="p-4 text-mainColor"
                title="选择要查看的月份"
                type="year-month"
                value={dateValue.value}
                onConfirm={onChoseMonth}
                onCancel={onClose}
                formatter={(type: string, val: string) => {
                    if (type === 'year') return `${val} 年`
                    if (type === 'month') return `${val} 月`
                    return val
                }}
                maxDate={dateValue.maxDate}
            />
        </Popup>
    )
}