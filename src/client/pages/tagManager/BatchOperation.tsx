import React, { useRef, useState } from 'react'
import { useBatchDeleteTag, useBatchSetTagGroup, useBatchSetTagColor } from '../../services/tag'
import { Button, Col, Dropdown, Row } from 'antd'
import { messageSuccess, messageWarning } from '../../utils/message'
import { STATUS_CODE } from '@/config'
import { ColorPicker } from '@/client/components/ColorPicker'
import { SwapOutlined, BgColorsOutlined, DeleteOutlined, DiffOutlined, ExportOutlined } from '@ant-design/icons'
import { TagGroupListItem } from '@/types/tag'
import { CSSTransition } from 'react-transition-group'
import { MobileDrawer } from '@/client/components/MobileDrawer'

interface Props {
    tagGroups: TagGroupListItem[]
}

export const useBatchOperation = (props: Props) => {
    // 是否处于批量操作模式
    const [isBatch, setIsBatch] = useState(false)
    // 当前选中的标签
    const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
    // 删除标签
    const { mutateAsync: deleteTag } = useBatchDeleteTag()
    // 批量设置标签颜色
    const { mutateAsync: updateTagColor } = useBatchSetTagColor()
    // 批量设置标签分组
    const { mutateAsync: updateTagGroup } = useBatchSetTagGroup()
    // 是否显示颜色选择弹窗
    const [showColorPicker, setShowColorPicker] = useState(false)
    /** 是否显示移动端批量操作弹窗 */
    const [showBatchModal, setShowBatchModal] = useState(false)
    /** 是否显示移动端的分组选择抽屉 */
    const [showGroupDrawer, setShowGroupDrawer] = useState(false)

    const isTagSelected = (id: number) => {
        return selectedTagIds.includes(id)
    }

    const onSelectTag = (id: number) => {
        // 如果有了就删除，没有就添加
        if (isTagSelected(id)) setSelectedTagIds(selectedTagIds.filter(item => item !== id))
        else setSelectedTagIds([...selectedTagIds, id])
    }

    const onSaveDelete = async () => {
        if (selectedTagIds.length === 0) {
            messageWarning('请选择需要删除的标签')
            return
        }
        const resp = await deleteTag({ ids: selectedTagIds })
        if (resp.code !== STATUS_CODE.SUCCESS) return

        messageSuccess('删除成功')
        setSelectedTagIds([])
    }

    const onSaveColor = async (color: string) => {
        if (selectedTagIds.length === 0) {
            messageWarning('请选择需要设置颜色的标签')
            return
        }

        const resp = await updateTagColor({ ids: selectedTagIds, color })
        if (resp.code !== STATUS_CODE.SUCCESS) return

        messageSuccess('设置成功')
        setSelectedTagIds([])
    }

    const onSaveGroup = async (groupId: number) => {
        if (selectedTagIds.length === 0) {
            messageWarning('请选择需要设置分组的标签')
            return
        }

        const resp = await updateTagGroup({ ids: selectedTagIds, groupId })
        if (resp.code !== STATUS_CODE.SUCCESS) return

        messageSuccess('设置成功')
        setSelectedTagIds([])
    }

    const renderBatchBtn = () => {
        if (!isBatch) {
            return (
                <Button
                    onClick={() => setIsBatch(true)}
                    icon={<DiffOutlined />}
                >批量操作</Button>
            )
        }

        /** 批量转移分组的待选项 */
        const moveGroupItems = props.tagGroups.map(item => {
            return {
                key: item.id,
                label: (
                    <div onClick={() => onSaveGroup(item.id)}>
                        {item.title}
                    </div>
                )
            }
        })

        return (<>
            <Button
                onClick={() => {
                    setIsBatch(false)
                    setSelectedTagIds([])
                }}
                icon={<ExportOutlined />}
            >退出批量操作</Button>
            <Dropdown menu={{ items: moveGroupItems }} placement="bottom">
                <Button
                    icon={<SwapOutlined />}
                >批量移动分组</Button>
            </Dropdown>
            <Button
                onClick={() => setShowColorPicker(true)}
                icon={<BgColorsOutlined />}
            >批量设置颜色</Button>
            <Button
                onClick={onSaveDelete}
                danger
                icon={<DeleteOutlined />}
            >批量删除</Button>
        </>)
    }

    const transitionRef = useRef(null)

    const renderMobileBatchBtn = () => {
        return (
            <CSSTransition
                in={isBatch}
                nodeRef={transitionRef}
                timeout={300}
                classNames="batch-modal"
                onEnter={() => setShowBatchModal(true)}
                onExited={() => setShowBatchModal(false)}
            >
                <Row gutter={[8, 8]} ref={transitionRef}>
                    {showBatchModal && (<>
                        <Col span={24}>
                            <div className="text-center text-sm text-gray-500">批量编辑模式</div>
                        </Col>
                        <Col span={8}>
                            <Button
                                onClick={onSaveDelete}
                                danger
                                block
                                size="large"
                                icon={<DeleteOutlined />}
                            >删除</Button>
                        </Col>
                        <Col span={8}>
                            <Button
                                onClick={() => setShowColorPicker(true)}
                                block
                                size="large"
                                icon={<BgColorsOutlined />}
                            >颜色</Button>
                        </Col>
                        <Col span={8}>
                            <Button
                                onClick={() => setShowGroupDrawer(true)}
                                block
                                size="large"
                                icon={<SwapOutlined />}
                            >移动</Button>
                        </Col>
                    </>)}
                </Row>
            </CSSTransition>
        )
    }

    const renderBatchModal = () => {
        return (<>
            <ColorPicker
                onChange={onSaveColor}
                visible={showColorPicker}
                onClose={() => setShowColorPicker(false)}
            />
        </>)
    }

    const renderBatchGroupSelect = () => {
        /** 批量转移分组的待选项 */
        const moveGroupItems = props.tagGroups.map(item => {
            return (
                <Button
                    size="large"
                    className="mb-2"
                    block
                    key={item.id}
                    onClick={() => {
                        onSaveGroup(item.id)
                        setShowGroupDrawer(false)
                    }}
                >
                    {item.title}
                </Button>
            )
        })

        return (
            <MobileDrawer
                title='目标分组选择'
                open={showGroupDrawer}
                onClose={() => setShowGroupDrawer(false)}
            >
                {moveGroupItems}
            </MobileDrawer>
        )
    }

    return {
        isBatch, isTagSelected, onSelectTag, setIsBatch,
        renderBatchBtn, renderBatchModal, renderBatchGroupSelect, renderMobileBatchBtn
    }
}