import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDeleteArticle } from '../../services/article'
import { messageSuccess } from '@/client/utils/message'
import { STATUS_CODE } from '@/config'
import { Button, Modal } from 'antd'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { useIsMobile } from '@/client/layouts/Responsive'

interface TargetArticleInfo {
    title: string
    id: number
}

export const useDelete = () => {
    const navigate = useNavigate()
    const isMobile = useIsMobile()
    // 删除文章
    const { mutateAsync: deleteArticle } = useDeleteArticle()
    // 是否删除子文章
    const [deleteChildren, setDeleteChildren] = useState(false)
    /** 要删除的文章信息 */
    const [articleInfo, setArticleInfo] = useState<TargetArticleInfo>()

    const onDelete = async () => {
        if (!articleInfo) {
            messageSuccess('请选择要删除的文章')
            return
        }

        const resp = await deleteArticle({
            id: articleInfo.id,
            force: deleteChildren
        })
        if (resp.code !== STATUS_CODE.SUCCESS) return

        messageSuccess('删除成功')
        navigate(`/article/${resp.data?.parentArticleId}`)
    }

    /** 渲染删除确认弹窗 */
    const renderDeleteModal = () => {
        return (
            <Modal
                title={`删除 “${articleInfo?.title || ''}”`}
                open={!!articleInfo}
                onOk={async () => {
                    await onDelete()
                    setArticleInfo(undefined)
                }}
                onCancel={() => {
                    setArticleInfo(undefined)
                    setDeleteChildren(false)
                }}
                okText='删除'
                cancelText='取消'
                okButtonProps={{ danger: true }}
                width={400}
                style={isMobile ? { top: '45%' } : undefined}
            >
                <div className="mb-2">
                    删除后笔记将无法恢复，请谨慎操作
                </div>

                <Button
                    block
                    danger
                    type={deleteChildren ? 'primary' : 'default'}
                    onClick={() => setDeleteChildren(!deleteChildren)}
                    icon={deleteChildren ? <CheckOutlined /> : <CloseOutlined />}
                >
                    删除子笔记
                </Button>
            </Modal>
        )
    }

    return { renderDeleteModal, showDeleteDialog: setArticleInfo }
}
