import React, { FC } from 'react'
import { Button, Col, List, Modal, Row, Space } from 'antd'
import { MobileDrawer } from './MobileDrawer'
import { TagListItem } from '@/types/tag'
import { useQueryTagGroup, useQueryTagList } from '../services/tag'
import { useAllTagGroup, useGroupedTag } from '../pages/tagManager/tagHooks'
import { ControlOutlined } from '@ant-design/icons'
import { Tag } from './Tag'
import Loading from '../layouts/Loading'
import { useIsMobile } from '../layouts/Responsive'
import { useNavigate } from 'react-router-dom'

interface Props {
    open: boolean
    onClose: () => void
    selectedTags: number[]
    onSelected: (item: TagListItem) => void
}

/**
 * 标签选择器
 */
export const TagPicker: FC<Props> = (props) => {
    const { open, onClose, selectedTags, onSelected } = props
    const isMobile = useIsMobile()
    const navigate = useNavigate()
    // 获取标签分组
    const { data: tagGroupResp, isLoading: isLoadingGroup } = useQueryTagGroup()
    // 分组列表
    const { tagGroups } = useAllTagGroup(tagGroupResp?.data)
    // 获取标签列表
    const { data: tagListResp, isLoading: isTagLoading } = useQueryTagList()
    // 分好组的标签
    const { groupedTagDict } = useGroupedTag(tagListResp?.data || [])

    const renderTag = (item: TagListItem) => {
        return (
            <Tag
                key={item.id}
                color={item.color}
                selected={selectedTags.includes(item.id)}
                onClick={() => onSelected(item)}
            >{item.title}</Tag>
        )
    }

    const renderContent = () => {
        if (isTagLoading) return <Loading tip='加载标签中...' />
        if (isLoadingGroup) return <Loading tip='加载分组中...' />

        return (
            <List
                className="mx-2"
                dataSource={tagGroups}
                renderItem={item => {
                    const tags = groupedTagDict[item.id] || []
                    return (
                        <List.Item>
                            <div>
                                <div className="text-lg font-bold mb-2">
                                    {item.title}
                                </div>
                                <div>
                                    <Space wrap size={[0, 8]}>
                                        {tags.map(renderTag)}
                                    </Space>
                                </div>
                            </div>
                        </List.Item>
                    )
                }}
            />
        )
    }

    const renderModal = () => {
        if (isMobile) return (
            <MobileDrawer
                title='标签选择'
                open={open}
                onClose={onClose}
                footer={(
                    <Row gutter={8}>
                        <Col flex="0">
                            <Button
                                size="large"
                                icon={<ControlOutlined />}
                                onClick={() => navigate('/tags')}
                            />
                        </Col>
                        <Col flex="1">
                            <Button
                                block
                                size="large"
                                onClick={onClose}
                            >关闭</Button>
                        </Col>
                    </Row>
                )}
            >
                {renderContent()}
            </MobileDrawer>
        )
        
        return (
            <Modal
                title='标签选择'
                open={open}
                onCancel={onClose}
                onOk={onClose}
                cancelButtonProps={{
                    onClick: () => navigate('/tags')
                }}
                cancelText='管理标签'
            >
                {renderContent()}
            </Modal>
        )
    }

    return renderModal()
}