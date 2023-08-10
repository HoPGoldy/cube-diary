import React, { FC, MouseEventHandler, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { PageContent, PageAction } from '../../layouts/pageWithAction'
import Loading from '../../layouts/loading'
import { Image } from 'antd'
import { PageTitle } from '@/client/components/pageTitle'
import { useQueryDiaryList } from '@/client/services/diary'
import { DiaryListItem } from './listItem'
import { useOperation } from './operation'
import s from './styles.module.css'
import { useAtomValue } from 'jotai'
import { stateFocusDiaryDate } from '@/client/store/global'
import { useDragPoint } from './useDragPoint'

/**
 * 日记列表
 * 一月一页，包含当月所有日记
 */
const MonthList: FC = () => {
    const { month } = useParams()
    /** 要跳转到的日记 */
    const focusDate = useAtomValue(stateFocusDiaryDate)
    /** 获取日记列表 */
    const { data: monthListResp, isLoading } = useQueryDiaryList(month)
    /** 当前正在预览的图片链接 */
    const [visibleImgSrc, setVisibleImgSrc] = useState('')
    /** 底部操作栏 */
    const { renderMobileBar } = useOperation()
    /** 列表底部 div 引用 */
    const listBottomRef = useRef<HTMLDivElement>(null)
    /** 上下月切换功能 */
    const { renderBottomPoint, renderTopPoint, listListener } = useDragPoint()
    
    const onClickDetail: MouseEventHandler<HTMLDivElement> = (e) => {
        const target = (e.target as HTMLImageElement)
        if (target?.tagName === 'IMG') {
            setVisibleImgSrc(target.src)
        }
    }

    const renderContent = () => {
        if (isLoading) return <Loading />

        return (
            <div className={s.listContainer}>
                {monthListResp?.data?.map(item => (
                    <div data-diary-date={item.date} key={item.date}>
                        <DiaryListItem item={item} />
                    </div>
                ))}
            </div>
        )
    }

    useEffect(() => {
        if (!focusDate) {
            listBottomRef.current?.scrollIntoView()
            return
        }

        const targetDiv = document.querySelector(`[data-diary-date='${focusDate}']`)
        if (targetDiv) targetDiv.scrollIntoView()
    }, [monthListResp])

    return (<>
        <PageTitle title='日记列表' />

        <PageContent>
            <div className="mx-4 mt-4 relative" onClick={onClickDetail} {...listListener}>
                {renderTopPoint()}
                {renderContent()}
                {renderBottomPoint()}
            </div>
            <div ref={listBottomRef}></div>
            <Image
                preview={{
                    visible: !!visibleImgSrc,
                    src: visibleImgSrc,
                    onVisibleChange: () => setVisibleImgSrc(''),
                }}
            />
        </PageContent>

        <PageAction>
            {renderMobileBar()}
        </PageAction>
    </>)
}

export default MonthList