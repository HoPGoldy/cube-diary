import React, { FC, MouseEventHandler, useState } from 'react'
import { useParams } from 'react-router-dom'
import { PageContent, PageAction } from '../../layouts/PageWithAction'
import Loading from '../../layouts/Loading'
import { Image, List } from 'antd'
import { PageTitle } from '@/client/components/PageTitle'
import { useQueryDiaryList } from '@/client/services/diary'
import { DiaryListItem } from './listItem'
import { useOperation } from './operation'


/**
 * 日记列表
 * 一月一页，包含当月所有日记
 */
const MonthList: FC = () => {
    const { month } = useParams()
    /** 获取日记列表 */
    const { data: monthListResp, isLoading } = useQueryDiaryList(month)
    /** 当前正在预览的图片链接 */
    const [visibleImgSrc, setVisibleImgSrc] = useState('')
    /** 底部操作栏 */
    const { renderMobileBar } = useOperation()
    
    const onClickDetail: MouseEventHandler<HTMLDivElement> = (e) => {
        const target = (e.target as HTMLImageElement)
        if (target?.tagName === 'IMG') {
            setVisibleImgSrc(target.src)
        }
    }

    const renderContent = () => {
        if (isLoading) return <Loading />

        return (
            <List
                grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 4 }}
                dataSource={monthListResp?.data || []}
                renderItem={item => <DiaryListItem item={item} />}
            />
        )
    }

    return (<>
        <PageTitle title='用户管理' />

        <PageContent>
            <div className="m-4" onClick={onClickDetail}>
                {renderContent()}
            </div>
            <Image
                style={{ display: 'none' }}
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