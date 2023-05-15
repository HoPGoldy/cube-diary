import React, { useState } from 'react'
import { TagGroupListItem } from '@/types/tag'
import { useDeleteTagGroup } from '../../services/tag'
import { messageSuccess } from '../../utils/message'
import { Button, Modal } from 'antd'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons'

export const useDeleteGroup = () => {
    // 要删除的分组信息
    const [deleteGroup, setDeleteGroup] = useState<TagGroupListItem | null>(null)
    // 是否删除子文章
    const [deleteChildren, setDeleteChildren] = useState(false)
    // 删除分组请求
    const { mutateAsync: deleteTagGroup } = useDeleteTagGroup()

    const onClickDeleteGroup = (item: TagGroupListItem) => {
        setDeleteGroup(item)
    }

    const onDelete = async() => {
        if (!deleteGroup) return
        await deleteTagGroup({
            id: deleteGroup.id,
            method: deleteChildren ? 'force' : 'move'
        })

        messageSuccess('分组删除成功')
    }

    const closeDeleteModal = () => {
        setDeleteGroup(null)
        setDeleteChildren(false)
    }

    const renderDeleteModal = () => {
        return (
            <Modal
                title={`${deleteGroup?.title || ''} 分组删除`}
                open={!!deleteGroup}
                onOk={async () => {
                    await onDelete()
                    closeDeleteModal()
                }}
                onCancel={closeDeleteModal}
                okText='删除'
                cancelText='取消'
                okButtonProps={{ danger: true }}
            >
                <div style={{ marginBottom: '0.2rem' }}>
                    删除后分组将无法恢复，请谨慎操作
                </div>
                <div style={{ marginBottom: '0.8rem' }}>
                    {deleteChildren ? '下属标签将会直接删除' : '下属标签将会被移至默认分组'}
                </div>
                <Button
                    block
                    danger
                    type={deleteChildren ? 'primary' : 'default'}
                    onClick={() => setDeleteChildren(!deleteChildren)}
                    icon={deleteChildren ? <CheckOutlined /> : <CloseOutlined />}
                >
                    删除子标签
                </Button>
            </Modal>
        )
    }

    return {
        renderDeleteModal, onClickDeleteGroup
    }
}