import { ActionButton, ActionIcon, PageAction, PageContent } from '@/client/layouts/PageWithAction'
import { Card } from 'antd'
import React, { FC } from 'react'
import { useChangePasswordContent } from './content'
import { LeftOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { PageTitle } from '@/client/components/PageTitle'

const ChangePassword: FC = () => {
    const navigate = useNavigate()
    const { renderContent, onSavePassword, isChangingPassword } = useChangePasswordContent()

    return (<>
        <PageTitle title='修改密码' />
        <PageContent>
            <div className="m-2">
                <Card size="small" className='text-center text-base font-bold mb-2'>
                    用户管理
                </Card>
                <Card size="small" className='text-base'>
                    {renderContent()}
                </Card>
            </div>
        </PageContent>
        <PageAction>
            <ActionIcon icon={<LeftOutlined />} onClick={() => navigate(-1)} />
            <ActionButton
                onClick={onSavePassword}
                loading={isChangingPassword}
            >保存</ActionButton>
        </PageAction>
    </>)
}

export default ChangePassword