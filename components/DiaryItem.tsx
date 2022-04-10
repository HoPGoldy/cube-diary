import { FC } from 'react'
import { Card } from 'react-vant'
import { Diary, UndoneDiary } from '@pages/api/month/[queryMonth]'
import { DiaryItemInteract } from './DiaryItemInteract'
import dayjs from 'dayjs';
import { WEEK_TO_CHINESE } from 'lib/constants'
import { CardProps } from 'react-vant/es/card/PropsType'
import { CommentO } from '@react-vant/icons'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'

export type DiaryItemProps = {
    diary: Diary | UndoneDiary
    onClickBody: () => unknown
    showInteract: boolean
} & CardProps

export const DiaryItem: FC<DiaryItemProps> = (props) => {
    const { diary, onClickBody, showInteract } = props

    const date = dayjs(diary.date)
    const label = `${date.format('MM 月 DD 日')} ${WEEK_TO_CHINESE[date.day()]}`

    if ('undone' in diary) {
        return (
            <Link href={`/diary/write/${dayjs(diary.date).format('YYYY-MM-DD')}`} passHref>
                <div className="w-full">
                    <Card round>
                        <Card.Header extra={<CommentO />} >
                            <span className="text-gray-400">{label}</span>
                        </Card.Header>
                    </Card>
                </div>
            </Link>
        )
    }

    return (
        <Card round>
            <Card.Header>
                <span className="text-gray-400">{label}</span>
            </Card.Header>
            <Card.Body onClick={onClickBody}>
                <ReactMarkdown>{diary.content}</ReactMarkdown>
                {showInteract && <DiaryItemInteract />}
            </Card.Body>
        </Card>
    )
}