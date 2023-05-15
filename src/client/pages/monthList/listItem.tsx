import { Diary, UndoneDiary } from '@/types/diary'
import { Card, List } from 'antd'
import dayjs from 'dayjs'
import React, { FC, useMemo } from 'react'

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

/**
 * 日记列表项组件
 */
export const DiaryListItem: FC<Props> = ({ item }) => {
    const title = useMemo(() => {
        const date = dayjs(item.date)
        return `${date.format('MM 月 DD 日')} ${WEEK_TO_CHINESE[date.day()]}`
    }, [item.date])

    if ('undone' in item) {
        return (
            <List.Item>
                <Card size="small">
                    <div className="text-gray-400">
                        {title}
                    </div>
                </Card>
            </List.Item>
        )
    }

    return (
        <List.Item>
            <Card
                title={<div className="text-gray-400">{title}</div>}
                size="small"
                extra={
                    <div className={`w-4 h-4 rounded-full ${item.color}`}></div>
                }
            >
                <div className="">
                    {item.content}
                </div>
            </Card>
        </List.Item>
    )
}