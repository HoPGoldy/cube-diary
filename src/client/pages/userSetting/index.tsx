import React, { FC, Fragment } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Card, Col, Row, Statistic, Switch } from 'antd'
import { SnippetsOutlined, HighlightOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { useChangePassword } from '../changePassword'
import { ActionButton, PageAction, PageContent } from '@/client/layouts/PageWithAction'
import { UserOutlined, RightOutlined, LogoutOutlined } from '@ant-design/icons'
import { Cell, SplitLine } from '@/client/components/Cell'
import { SettingLinkItem, useSetting } from './useSetting'
import { AppTheme } from '@/types/user'
import { PageTitle } from '@/client/components/PageTitle'

interface DesktopProps {
    onClick: () => void
}

export const DesktopSetting: FC<DesktopProps> = (props) => {
    /** 修改密码功能 */
    const { renderChangePasswordModal, showChangePassword } = useChangePassword()
    /** 设置功能 */
    const setting = useSetting()

    const renderConfigItem = (item: SettingLinkItem) => {
        if (item.link === '/changePassword') {
            return (
                <Col span={24} key={item.link}>
                    <Button
                        block
                        onClick={showChangePassword}
                        icon={item.icon}
                    >{item.label}</Button>
                </Col>
            )
        }

        return (
            <Col span={24} key={item.link}>
                <Link to={item.link}>
                    <Button block icon={item.icon}>{item.label}</Button>
                </Link>
            </Col>
        )
    }

    return (
        <div style={{ width: '16rem' }}>
            <div style={{ margin: '1rem 0rem' }}>
                <Row gutter={[16, 16]} justify="space-around">
                    <Col>
                        <Statistic title="笔记数量" value={setting.articleCount} prefix={<SnippetsOutlined />} />
                    </Col>
                    <Col>
                        <Statistic title="总字数" value={setting.articleLength} prefix={<HighlightOutlined />} />
                    </Col>
                </Row>
            </div>
            <Row>
                <Col span={24}>
                    <div className="flex justify-between items-center mb-4">
                        黑夜模式
                        <Switch
                            checkedChildren="开启"
                            unCheckedChildren="关闭"
                            onChange={setting.onSwitchTheme}
                            checked={setting.userTheme === AppTheme.Light ? false : true}
                        />
                    </div>
                </Col>
            </Row>
            <Row gutter={[0, 8]} onClick={props.onClick}>
                {setting.settingConfig.map(renderConfigItem)}

                <Col span={24}>
                    <Button block danger onClick={setting.onLogout} icon={<CloseCircleOutlined />}>登出</Button>
                </Col>
            </Row>
            {renderChangePasswordModal()}
        </div>
    )
}


export const MobileSetting: FC = () => {
    const navigate = useNavigate()
    /** 设置功能 */
    const setting = useSetting()

    const renderConfigItem = (item: SettingLinkItem, index: number) => {
        return (<Fragment key={item.link}>
            <Link to={item.link}>
                <Cell
                    title={(<div>{item.icon} &nbsp;{item.label}</div>)}
                    extra={<RightOutlined />}
                />
            </Link>
            {index !== setting.settingConfig.length - 1 && <SplitLine />}
        </Fragment>)
    }

    return (<>
        <PageTitle title='设置' />

        <PageContent>
            <div className='p-4 text-base'>
                <Card size="small">
                    <Row justify="space-around">
                        <Col>
                            <Statistic title="笔记数量" value={setting.articleCount} prefix={<SnippetsOutlined />} />
                        </Col>
                        <Col>
                            <Statistic title="总字数" value={setting.articleLength} prefix={<HighlightOutlined />} />
                        </Col>
                    </Row>
                </Card>

                <Card size="small" className='mt-4'>
                    <Cell
                        title={(<div><UserOutlined /> &nbsp;登录用户</div>)}
                        extra={setting.userName}
                    />
                </Card>

                <Card size="small" className='mt-4'>
                    <Cell
                        title={(<div><UserOutlined /> &nbsp;黑夜模式</div>)}
                        extra={(
                            <Switch
                                checkedChildren="开启"
                                unCheckedChildren="关闭"
                                onChange={setting.onSwitchTheme}
                                checked={setting.userTheme === AppTheme.Light ? false : true}
                            />
                        )}
                    />
                    <SplitLine />

                    {setting.settingConfig.map(renderConfigItem)}
                </Card>

                <Card size="small" className='mt-4'>
                    <Cell
                        onClick={setting.onLogout}
                        title={(<div><UserOutlined /> &nbsp;登出</div>)}
                        extra={<LogoutOutlined />}
                    />
                </Card>
            </div>
        </PageContent>

        <PageAction>
            <ActionButton onClick={() => navigate(-1)}>返回</ActionButton>
        </PageAction>
    </>)
}
