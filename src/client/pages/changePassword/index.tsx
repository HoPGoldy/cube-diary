import React, { useState } from 'react'
import { useChangePasswordContent } from './content'
import { useNavigate } from 'react-router-dom'
import { Modal } from 'antd'
import { useIsMobile } from '@/client/layouts/Responsive'

export const useChangePassword = () => {
    const navigate = useNavigate()
    const isMobile = useIsMobile()
    /** 是否显示修改密码弹窗 */
    const [visible, setVisible] = useState(false)
    const { onSavePassword, renderContent } = useChangePasswordContent()

    /** 展示修改密码页面 */
    const showChangePassword = () => {
        if (isMobile) navigate('/changePassword')
        else setVisible(true)
    }

    /** 渲染修改密码弹窗 */
    const renderChangePasswordModal = () => {
        if (isMobile) return null

        return (
            <Modal
                open={visible}
                onCancel={() => setVisible(false)}
                onOk={async () => {
                    const success = await onSavePassword()
                    if (success) setVisible(false)
                }}
                title="修改密码"
            >
                {renderContent()}
            </Modal>
        )
    }

    return { showChangePassword, renderChangePasswordModal }
}
