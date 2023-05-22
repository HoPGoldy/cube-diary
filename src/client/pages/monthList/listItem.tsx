import { Diary, UndoneDiary } from '@/types/diary'
import { Card } from 'antd'
import dayjs from 'dayjs'
import React, { FC, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Preview from './preview'
import { MARK_COLORS_MAP } from '@/client/components/colorPicker'
import s from './styles.module.css'

interface Props {
    item: Diary | UndoneDiary
}

/**
 * 星期数字到汉字的映射
 */
export const WEEK_TO_CHINESE: Record<number, string> = {
    0: '周日',
    1: '周一',
    2: '周二',
    3: '周三',
    4: '周四',
    5: '周五',
    6: '周六'
}

export const getLabelByDate = (timestamp: number) => {
    const date = dayjs(timestamp)
    return `${date.format('MM 月 DD 日')} ${WEEK_TO_CHINESE[date.day()]}`
}

/**
 * 日记列表项组件
 */
export const DiaryListItem: FC<Props> = ({ item }) => {
    const navigate = useNavigate()

    const title = useMemo(() => getLabelByDate(item.date), [item.date])

    const onEdit = () => {
        navigate(`/diary/${dayjs(item.date).format('YYYYMMDD')}`)
    }

    if ('undone' in item) {
        return (
            <Card size="small" onClick={onEdit} className={s.listItem}>
                <div className="text-gray-400 font-bold cursor-pointer">
                    {title}
                </div>
            </Card>
        )
    }

    return (
        <Card
            title={
                <div
                    className="text-gray-400 font-bold cursor-pointer"
                    onClick={onEdit}
                >{title}</div>
            }
            className={s.listItem}
            size="small"
            extra={
                item.color &&
                <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: MARK_COLORS_MAP[item.color]}}
                ></div>
            }
        >
            <div data-diary-date={item.date}>
                <Preview value={item.content} />
            </div>
        </Card>
    )
}