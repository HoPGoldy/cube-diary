import { FC, MouseEvent } from 'react'
import { Card, ImagePreview } from 'react-vant'
import dayjs from 'dayjs';
import { WEEK_TO_CHINESE } from 'lib/constants'
import { CardProps } from 'react-vant/es/card/PropsType'
import { Ellipsis } from '@react-vant/icons'
import ReactMarkdown from 'react-markdown'
import Link from './Link';
import { getDiaryWriteUrl } from 'lib/utils/getDiaryWriteUrl';
import { Diary, UndoneDiary } from 'types/diary';

export type DiaryItemProps = {
    className?: string
    diary: Diary | UndoneDiary
    /**
     * 左上角日期格式化字符串
     */
    dateFormatter?: string
} & CardProps

/**
 * 判断一个事件目标是否为图片
 */
const isImage = (target: EventTarget): target is HTMLImageElement => {
    const { tagName } = target as HTMLImageElement
    return tagName === 'IMG'
}

export const DiaryItem: FC<DiaryItemProps> = (props) => {
    const { diary, dateFormatter = 'MM 月 DD 日' } = props

    const onClickBody = (e: MouseEvent<Element>) => {
        if (!isImage(e.target)) return
        ImagePreview.open({ images: [e.target.currentSrc], showIndex: false })
    }

    const date = dayjs(diary.date)
    const label = `${date.format(dateFormatter)} ${WEEK_TO_CHINESE[date.day()]}`

    if ('undone' in diary) {
        return (
            <Link href={getDiaryWriteUrl(diary.date)}>
                <Card round className="w-full">
                    <Card.Header>
                        <span className="text-gray-400">{label}</span>
                    </Card.Header>
                </Card>
            </Link>
        )
    }

    return (
        <Card round>
            <Card.Header
                extra={(
                    <Link href={getDiaryWriteUrl(diary.date)}>
                        <Ellipsis />
                    </Link>
                )}
            >
                <span className="text-gray-400">{label}</span>
            </Card.Header>

            <Card.Body onClick={onClickBody}>
                <ReactMarkdown>{diary.content}</ReactMarkdown>
            </Card.Body>
        </Card>
    )
}