import React, { useState } from 'react'
import { TagGroupListItem, TagListItem } from '@/types/tag'
import { useDeleteTag, useUpdateTag } from '../../services/tag'
import { messageSuccess } from '../../utils/message'
import { ColorPicker } from '@/client/components/ColorPicker'
import { STATUS_CODE } from '@/config'
import { blurOnEnter } from '@/client/utils/input'
import { Modal, Button, Row, Col, Select } from 'antd'
import { DEFAULT_TAG_GROUP } from '@/config'

interface Props {
    tagGroups: TagGroupListItem[]
}

export const useTagConfig = (props: Props) => {
    // 当前选中的标签详情
    const [currentTag, setCurrentTag] = useState<TagListItem | null>(null)
    // 是否显示颜色选择弹窗
    const [showColorPicker, setShowColorPicker] = useState(false)
    // 删除标签
    const { mutateAsync: deleteTag } = useDeleteTag()
    // 更新标签
    const { mutateAsync: updateTag, isLoading: isSavingTag } = useUpdateTag()

    const showTagDetail = (item: TagListItem) => {
        setCurrentTag({
            ...item,
            groupId: item.groupId || DEFAULT_TAG_GROUP
        })
    }

    const onClose = () => {
        setCurrentTag(null)
    }

    const onChangeDetail = (value: Partial<TagListItem>) => {
        setCurrentTag(prev => {
            if (!prev) return null
            return {
                ...prev,
                ...value
            }
        })
    }

    const onDeleteTag = async () => {
        if (!currentTag) return
        const resp = await deleteTag(currentTag.id)
        if (resp.code !== STATUS_CODE.SUCCESS) return
        messageSuccess('删除成功')
        onClose()
    }

    const saveChange = async () => {
        if (!currentTag) return
        const resp = await updateTag(currentTag)
        if (resp.code !== STATUS_CODE.SUCCESS) return
        messageSuccess('保存成功')
        onClose()
    }

    const renderTagDetail = () => {
        return (<>
            <Modal
                open={!!currentTag}
                closable={false}
                onCancel={onClose}
                footer={null}
                width="24rem"
            >
                <Row gutter={[16, 16]}>
                    <Col flex="auto" span={20}>
                        <input
                            className='font-bold text-lg dark:text-neutral-200'
                            value={currentTag?.title || ''}
                            onChange={e => onChangeDetail({ title: e.target.value })}
                            onKeyUp={blurOnEnter}
                        />
                    </Col>
                    <Col flex="none">
                        <div
                            className='inline-block w-6 h-6 ml-2 rounded-full cursor-pointer'
                            style={{ backgroundColor: currentTag?.color }}
                            onClick={() => setShowColorPicker(true)}
                        />
                    </Col>
                    <Col span={24}>
                        <div className="w-full flex items-center">
                            <span>所属分组：</span>
                            <Select
                                style={{ width: 'auto' }}
                                className="flex-1"
                                value={currentTag?.groupId}
                                onChange={groupId => onChangeDetail({ groupId })}
                                options={props.tagGroups}
                                fieldNames={{ label: 'title', value: 'id' }}
                            />
                        </div>
                    </Col>
                    <Col span={12}>
                        <Button
                            key="delete"
                            danger
                            block
                            onClick={onDeleteTag}
                        >删除标签</Button>
                    </Col>
                    <Col span={12}>
                        <Button
                            key="save"
                            type="primary"
                            block
                            onClick={saveChange}
                            loading={isSavingTag}
                        >保存</Button>
                    </Col>
                </Row>
            </Modal>
            <ColorPicker
                onChange={color => onChangeDetail({ color })}
                visible={showColorPicker}
                onClose={() => setShowColorPicker(false)}
            />
        </>
        )
    }

    return {
        showTagDetail, renderTagDetail
    }
}