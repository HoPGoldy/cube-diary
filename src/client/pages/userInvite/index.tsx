import React, { FC } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
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

const getStatusColor = (item: UserInviteFrontendDetail) => {
    if (!item.username) return 'bg-yellow-500'
    if (item.isBanned) return 'bg-red-500'
    return 'bg-green-500'
}

/**
 * 标签管理
 * 可以新增标签分组，设置标签颜色，移动标签到指定分组
 */
const TagManager: FC = () => {
    const navigate = useNavigate()
    /** 获取用户列表 */
    const { data: inviteListResp, isLoading } = useQueryInviteList()
    /** 新增邀请 */
    const { mutateAsync: addInvite, isLoading: isAddingInvite } = useAddInvite()
    /** 删除邀请 */
    const { mutateAsync: deleteInvite, isLoading: isDeleteingInvite } = useDeleteInvite()
    /** 封禁用户 */
    const { mutateAsync: banUser, isLoading: isBanningUser } = useBanUser()
    /** 是否为管理员 */
    const payload = useJwtPayload()

    /** 复制注册链接 */
    const copyRegisterLink = (inviteCode: string) => {
        const link = `${location.origin}${location.pathname}#/register/${inviteCode}`
        copy(link)
        messageSuccess('复制成功')
    }

    /** 封禁用户 */
    const onBanClick = async (item: UserInviteFrontendDetail) => {
        if (!item.userId) {
            messageWarning('该邀请码还未被使用')
            return
        }

        const isBanned = !item.isBanned
        await banUser({ userId: item.userId, isBanned })
        messageSuccess(isBanned ? '用户已封禁' : '用户已解禁')
    }

    /** 渲染每个邀请卡片的操作栏 */
    const renderActionBar = (item: UserInviteFrontendDetail) => {
        if (!item.username) return (<>
            <Col flex="1">
                <Button
                    block
                    onClick={() => copyRegisterLink(item.inviteCode)}
                >复制注册链接</Button>
            </Col>
            <Col flex="1">
                <Button
                    block
                    danger
                    onClick={() => deleteInvite(item.id)}
                    loading={isDeleteingInvite}
                >删除邀请码</Button>
            </Col>
        </>)

        if (item.isBanned) return (
            <Col flex="1">
                <Button
                    block
                    onClick={() => onBanClick(item)}
                    loading={isBanningUser}
                >解禁用户</Button>
            </Col>
        )
        else return (
            <Col flex="1">
                <Button
                    block
                    danger
                    onClick={() => onBanClick(item)}
                    loading={isBanningUser}
                >封禁用户</Button>
            </Col>
        )
    }

    const renderInviteItem = (item: UserInviteFrontendDetail) => {
        const statusColor = getStatusColor(item)

        return (
            <List.Item>
                <Card
                    title={item.username ? `已使用 - ${item.username}` : '未使用'}
                    size="small"
                    extra={
                        <div className={`w-4 h-4 rounded-full ${statusColor}`}></div>
                    }
                >
                    <div className="">
                        <Row>
                            <Col span={24}>
                                <div>
                                    邀请码：
                                    <span className="float-right">
                                        {item.inviteCode}
                                    </span>
                                </div>
                            </Col>
                            <Col span={24}>
                                <div>
                                    创建时间：
                                    <span className="float-right">
                                        {dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss')}
                                    </span>
                                </div>
                            </Col>
                            {item.username && (<>
                                <Col span={24}>
                                    <div>
                                        用户名：
                                        <span className="float-right">
                                            {item.username}
                                        </span>
                                    </div>
                                </Col>
                                <Col span={24}>
                                    <div>
                                        使用时间：
                                        <span className="float-right">
                                            {dayjs(item.useTime).format('YYYY-MM-DD HH:mm:ss')}
                                        </span>
                                    </div>
                                </Col>
                            </>)}
                        </Row>
                    </div>

                    <Row gutter={[8, 8]} className="mt-2">
                        {renderActionBar(item)}
                    </Row>
                </Card>
            </List.Item>
        )
    }

    const renderContent = () => {
        if (isLoading) return <Loading />

        return (
            <Row gutter={[16, 16]}>
                <DesktopArea>
                    <Col span={24}>
                        <Button
                            onClick={() => addInvite()}
                            loading={isAddingInvite}
                        >新增邀请码</Button>
                    </Col>
                </DesktopArea>
                <Col span={24}>
                    <List
                        grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 4 }}
                        dataSource={inviteListResp?.data || []}
                        renderItem={renderInviteItem}
                    />
                </Col>
            </Row>
        )
    }

    if (!payload.isAdmin) {
        return <Navigate to="/" replace />
    }

    return (<>
        <PageTitle title='用户管理' />

        <PageContent>
            <div className="m-4">
                <MobileArea>
                    <Card size="small" className='text-center text-base font-bold mb-2'>
                        用户管理
                    </Card>
                </MobileArea>
                {renderContent()}
            </div>
        </PageContent>
        <PageAction>
            <ActionIcon icon={<LeftOutlined />} onClick={() => navigate(-1)} />
            <ActionButton onClick={() => addInvite()}>新增邀请码</ActionButton>
        </PageAction>
    </>)
}

export default TagManager