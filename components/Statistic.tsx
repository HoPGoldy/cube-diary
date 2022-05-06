import { FC } from 'react'

interface Props {
    label: string | number
    value: string | number
}

/**
 * 一个简单的数据展示组件
 * 用于显示日记条数和总字数
 */
export const Statistic: FC<Props> = (props) => {
    return (
        <div>
            <div className="text-gray-500 text-base">{props.label}</div>
            <div className="text-3xl font-bold">{props.value}</div>
        </div>
    )
}