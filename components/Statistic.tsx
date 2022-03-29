import { FC } from 'react'

interface Props {
    label: string | number
    value: string | number
}

export const Statistic: FC<Props> = (props) => {
    return (
        <div>
            <div className="text-gray-500 text-base">{props.label}</div>
            <div className="text-3xl font-bold">{props.value}</div>
        </div>
    )
}