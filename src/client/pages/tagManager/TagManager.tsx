import React, { FC, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageContent, PageAction, ActionButton, ActionIcon } from '../../layouts/PageWithAction'
import { AddTagReqData, TagGroupListItem, TagListItem } from '@/types/tag'
import { useAddTag, useAddTagGroup, useQueryTagGroup, useQueryTagList, useUpdateTagGroup } from '../../services/tag'
import Loading from '../../layouts/Loading'
// import { Button } from '../../components/Button'
import dayjs from 'dayjs'
import { AddTag, Tag } from '../../components/Tag'
import { blurOnEnter } from '../../utils/input'
import { DEFAULT_TAG_GROUP } from '@/config'
import { useDeleteGroup } from './DeleteGroup'
import { useSetGroupColor } from './SetGroupColor'
import { useTagConfig } from './TagConfig'
import { useBatchOperation } from './BatchOperation'
import { useAllTagGroup, useGroupedTag } from './tagHooks'
import { Col, Row, Button, Space, List, Card } from 'antd'
import { PlusOutlined, DeleteOutlined, LeftOutlined, BuildOutlined, DownSquareOutlined } from '@ant-design/icons'
import { DesktopArea, MobileArea } from '@/client/layouts/Responsive'
import { PageTitle } from '@/client/components/PageTitle'

/**
 * 标签管理
 * 可以新增标签分组，设置标签颜色，移动标签到指定分组
 */
const TagManager: FC = () => {
    const navigate = useNavigate()
    // 获取标签分组
    const { data: tagGroupResp, isLoading } = useQueryTagGroup()
    // 获取标签分组
    const { tagGroups, setTagGroups } = useAllTagGroup(tagGroupResp?.data)
    // 获取标签列表
    const { data: tagListResp, isLoading: isLoadingTagList } = useQueryTagList()
    // 分组后的标签列表
    const { groupedTagDict } = useGroupedTag(tagListResp?.data)
    // 新增分组
    const { mutateAsync: addTagGroup, isLoading: isAddingGroup } = useAddTagGroup()
    // 标题输入框引用
    const titleInputRefs = useRef<Record<string, HTMLInputElement>>({})
    // 更新分组标题
    const { mutateAsync: updateGroup } = useUpdateTagGroup()
    // 新增标签
    const { mutateAsync: addTag, isLoading: isAddingTag } = useAddTag()
    // 功能 - 删除分组
    const { onClickDeleteGroup, renderDeleteModal } = useDeleteGroup()
    // 功能 - 设置分组内标签颜色
    const { renderColorPicker, onClickSetGroupColor } = useSetGroupColor({ groupedTagDict })
    // 功能 - 标签详情管理
    const { renderTagDetail, showTagDetail } = useTagConfig({ tagGroups })
    // 功能 - 批量操作
    const {
        isBatch, setIsBatch, isTagSelected, onSelectTag,
        renderBatchBtn, renderBatchModal, renderMobileBatchBtn, renderBatchGroupSelect
    } = useBatchOperation({ tagGroups })

    const onAddGroup = async () => {
        const title = `新分组 ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`
        const resp = await addTagGroup({ title })
        if (!resp.data) return

        const timer = setTimeout(() => {
            if (!resp.data) return
            const input = titleInputRefs.current[resp.data]
            input?.focus()
            input?.setSelectionRange(0, title.length)
        }, 200)

        return () => clearTimeout(timer)
    }

    const onTitleChange = (value: string, item: TagGroupListItem) => {
        item.title = value
        setTagGroups([...tagGroups])
    }

    const onSaveGroupTitle = async (item: TagGroupListItem) => {
        updateGroup({ ...item }) 
    }

    const onClickTag = (item: TagListItem) => {
        if (isBatch) onSelectTag(item.id)
        else showTagDetail(item)
    }

    const onClickAddBtn = async (title: string, groupId: number) => {
        if (!title) return

        const data: AddTagReqData = { title, color: '#404040' }
        if (groupId !== DEFAULT_TAG_GROUP) data.groupId = groupId

        const resp = await addTag(data)
        if (!resp?.data) return
    }

    const renderTagItem = (item: TagListItem) => {
        return (
            <Tag
                key={item.id}
                color={item.color}
                selected={isBatch ? isTagSelected(item.id) : undefined}
                onClick={() => onClickTag(item)}
            >{item.title}</Tag>
        )
    }

    const renderTagGroupItem = (item: TagGroupListItem) => {
        const tags = groupedTagDict[item.id] || []
        return (
            <List.Item>
                <Card
                    title={(
                        <input
                            ref={ins => ins && (titleInputRefs.current[item.id] = ins)}
                            className="w-full text-base dark:text-neutral-200"
                            value={item.title}
                            onChange={e => onTitleChange(e.target.value, item)}
                            onKeyUp={blurOnEnter}
                            onBlur={() => onSaveGroupTitle(item)}
                            disabled={item.id === DEFAULT_TAG_GROUP}
                        />
                    )}
                    size="small"
                    extra={(
                        <Space style={{ margin: '0.8rem 0rem' }}>
                            {!isBatch && <Button
                                onClick={() => onClickSetGroupColor(item)}
                            >调整颜色</Button>}

                            {!isBatch && item.id !== -1 && <Button
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => onClickDeleteGroup(item)}
                            ></Button>}
                        </Space>
                    )}
                >
                    {tags.map(renderTagItem)}
                    {!isBatch && <AddTag
                        onFinish={title => onClickAddBtn(title, item.id)}
                        loading={isAddingTag}
                    />}
                </Card>
            </List.Item>
        )
    }

    const renderContent = () => {
        if (isLoading || isLoadingTagList) return <Loading />

        return (<>
            <div className="md:p-2">
                <Row gutter={[16, 16]}>
                    <DesktopArea>
                        <Col span={24}>
                            <Space>
                                <Button onClick={onAddGroup} loading={isAddingGroup} icon={<PlusOutlined />}>新增分组</Button>
                                {renderBatchBtn()}
                            </Space>
                        </Col>
                    </DesktopArea>
                    <Col span={24}>
                        <List
                            grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 3, xl: 3, xxl: 3 }}
                            dataSource={tagGroups}
                            renderItem={renderTagGroupItem}
                        />
                    </Col>
                </Row>
            </div>
        </>)
    }

    return (<>
        <PageTitle title='标签管理' />

        <PageContent>
            <div className="box-border p-2 flex flex-col flex-nowrap h-full">
                <div className="flex-grow overflow-y-auto overflow-x-hidden">
                    <MobileArea>
                        <Card size="small" className='text-center text-base font-bold mb-2'>
                            标签管理
                        </Card>
                    </MobileArea>
                    {renderContent()}
                </div>
                <MobileArea>
                    <div className="flex-shrink-0">
                        {renderMobileBatchBtn()}
                        {renderBatchGroupSelect()}
                    </div>
                </MobileArea>
            </div>
        </PageContent>
        <PageAction>
            <ActionIcon icon={<LeftOutlined />} onClick={() => navigate(-1)} />
            <ActionIcon
                icon={isBatch ? <DownSquareOutlined /> : <BuildOutlined />}
                onClick={() => setIsBatch(!isBatch)}
            />
            <ActionButton onClick={onAddGroup} loading={isAddingGroup}>新增分组</ActionButton>
        </PageAction>

        {renderDeleteModal()}
        {renderColorPicker()}
        {renderBatchModal()}
        {renderTagDetail()}
    </>)
}

export default TagManager