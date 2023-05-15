import React, { FC } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { PageContent, PageAction, ActionButton, ActionIcon } from '../../layouts/PageWithAction'
import Loading from '../../layouts/Loading'
import { Col, Row, Button, List, Card } from 'antd'
import { UserInviteFrontendDetail } from '@/types/userInvite'
import { useAddInvite, useBanUser, useDeleteInvite, useQueryInviteList } from '@/client/services/userInvite'
import { LeftOutlined } from '@ant-design/icons'
import copy from 'copy-to-clipboard'
import { messageSuccess, messageWarning } from '@/client/utils/message'
import dayjs from 'dayjs'
import { DesktopArea, MobileArea } from '@/client/layouts/Responsive'
import { useJwtPayload } from '@/client/utils/jwt'
import { PageTitle } from '@/client/components/PageTitle'
import { useQueryDiaryList } from '@/client/services/diary'
import { Diary, UndoneDiary } from '@/types/diary'
import { DiaryListItem } from './listItem'

const getStatusColor = (item: UserInviteFrontendDetail) => {
    if (!item.username) return 'bg-yellow-500'
    if (item.isBanned) return 'bg-red-500'
    return 'bg-green-500'
}

/**
 * 日记列表
 * 一月一页，包含当月所有日记
 */
const MonthList: FC = () => {
    const navigate = useNavigate()
    const { month } = useParams()
    /** 获取日记列表 */
    const { data: monthListResp, isLoading } = useQueryDiaryList(month)
    console.log('🚀 ~ file: index.tsx:32 ~ monthListResp:', monthListResp)
    /** 新增邀请 */
    const { mutateAsync: addInvite, isLoading: isAddingInvite } = useAddInvite()
    /** 删除邀请 */
    const { mutateAsync: deleteInvite, isLoading: isDeleteingInvite } = useDeleteInvite()
    /** 封禁用户 */
    const { mutateAsync: banUser, isLoading: isBanningUser } = useBanUser()
    /** 是否为管理员 */
    const payload = useJwtPayload()

    const renderUndoneDiary = (item: UndoneDiary) => {
        return (
            <List.Item>
                <Card size="small">
                    <div className="">
                        {item.date}
                    </div>
                </Card>
            </List.Item>
        )
    }

    const renderDiaryItem = (item: Diary | UndoneDiary) => {
        if ('undone' in item) return renderUndoneDiary(item)

        return (
            <List.Item>
                <Card
                    title={item.date}
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

    if (!payload.isAdmin) {
        return <Navigate to="/" replace />
    }

    return (<>
        <PageTitle title='用户管理' />

        <PageContent>
            <div className="m-4">
                {renderContent()}
            </div>
        </PageContent>
        <PageAction>
            <ActionIcon icon={<LeftOutlined />} onClick={() => navigate(-1)} />
            <ActionButton onClick={() => addInvite()}>新增邀请码</ActionButton>
        </PageAction>
    </>)
}

export default MonthList