import { useQueryArticleList } from '@/client/services/article'
import { SearchArticleDetail } from '@/types/article'
import React, { FC, useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { PageContent, PageAction, ActionIcon, ActionSearch } from '../../layouts/PageWithAction'
import { useTagArea } from './TagArea'
import { useQueryTagList } from '@/client/services/tag'
import { useTagDict } from '../tagManager/tagHooks'
import { Tag } from '@/client/components/Tag'
import { Card, Col, Input, List, Row, Space } from 'antd'
import { PAGE_SIZE } from '@/config'
import { DesktopArea } from '@/client/layouts/Responsive'
import { TagOutlined, LeftOutlined } from '@ant-design/icons'
import { PageTitle } from '@/client/components/PageTitle'

/**
 * 搜索页面
 * 可以通过关键字和标签来搜索笔记
 */
const SearchArticle: FC = () => {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    // 搜索关键字
    const [keyword, setKeyword] = useState(() => (searchParams.get('keyword') || ''))
    // 获取标签列表
    const { data: tagListResp, isLoading: isTagLoading } = useQueryTagList()
    // 标签映射
    const tagDict = useTagDict(tagListResp?.data || [])
    // 当前分页
    const [currentPage, setCurrentPage] = useState(1)
    // 功能 - 标签选择
    const {
        selectedTag,
        renderTagSelectPanel,
        renderMobileTagSelectPanel,
        setIsTagDrawerOpen,
    } = useTagArea({ setCurrentPage, isTagLoading, tagList: tagListResp?.data })
    // 搜索结果列表
    const { data: articleListResp, isLoading: isSearching } = useQueryArticleList({
        keyword,
        tagIds: selectedTag,
        page: currentPage,
    })
    /** 搜索列表占位文本 */
    const [listEmptyText, setListEmptyText] = useState<string>()

    useEffect(() => {
        if (!listEmptyText) setListEmptyText('输入关键字或选择标签进行搜索')
        else setListEmptyText('没有找到相关笔记')
    }, [isSearching])

    const renderTagItem = (tagId: number) => {
        const item = tagDict.get(tagId)
        if (!item) return null

        return (
            <Tag
                key={item.id}
                color={item.color}
            >{item.title}</Tag>
        )
    }

    const onKeywordSearch = (value: string) => {
        setKeyword(value)
        setCurrentPage(1)

        // 更新 url 参数
        if (value) searchParams.set('keyword', value)
        else searchParams.delete('keyword')
        setSearchParams(searchParams, { replace: true })
    }

    const renderSearchItem = (item: SearchArticleDetail) => {
        const colorfulTitle = item.title.replace(keyword, `<span class='text-red-500'>${keyword}</span>`)
        const colorfulContent = item.content.replace(keyword, `<span class='text-red-500'>${keyword}</span>`)
        return (
            <Link to={`/article/${item.id}`} key={item.id}>
                <Card className='mb-4 hover:ring-2 ring-gray-300 dark:ring-neutral-500 transition-shadow' size='small'>
                    <Row justify="space-between">
                        <Col xs={24} md={{ flex: 'auto', span: 12 }}>
                            <div
                                className='font-bold text-lg'
                                dangerouslySetInnerHTML={{ __html: colorfulTitle }}
                            />
                        </Col>
                        <Col xs={24} md={{ flex: '1', span: 12 }}>
                            <Space wrap size={[0, 8]} className='flex flex-wrap md:flex-row-reverse mt-2 md:mt-0'>
                                {item.tagIds?.map(renderTagItem)}
                            </Space>
                        </Col>
                        <Col span={24}>
                            <div
                                className='text-sm text-gray-600 dark:text-neutral-300 mt-2'
                                dangerouslySetInnerHTML={{ __html: colorfulContent }}
                            />
                        </Col>
                    </Row>
                </Card>
            </Link>
        )
    }

    const renderContent = () => {
        return (
            <div className='p-4'>
                <DesktopArea>
                    <Input.Search
                        placeholder="请输入标题或者正文，回车搜索"
                        enterButton="搜索"
                        size="large"
                        onSearch={onKeywordSearch}
                    />
                </DesktopArea>
                <div className='md:my-4'>
                    <Row gutter={16}>
                        <Col xs={24} md={14} lg={16} xl={18}>
                            <List
                                loading={isSearching}
                                dataSource={articleListResp?.data?.rows || []}
                                renderItem={renderSearchItem}
                                locale={{ emptyText: listEmptyText }}
                                pagination={{
                                    total: articleListResp?.data?.total || 0,
                                    pageSize: PAGE_SIZE,
                                    current: currentPage,
                                    onChange: setCurrentPage,
                                    align: 'center',
                                }}
                            />
                        </Col>
                        <DesktopArea>
                            <Col md={10} lg={8} xl={6}>
                                {renderTagSelectPanel()}
                            </Col>
                        </DesktopArea>
                    </Row>
                </div>
            </div>
        )
    }

    return (<>
        <PageTitle title='搜索笔记' />

        <PageContent>
            {renderContent()}
        </PageContent>

        {renderMobileTagSelectPanel()}

        <PageAction>
            <ActionIcon icon={<LeftOutlined />} onClick={() => navigate(-1)} />
            <ActionIcon icon={<TagOutlined />} onClick={() => setIsTagDrawerOpen(true)} />
            <ActionSearch onSearch={onKeywordSearch} />
        </PageAction>
    </>)
}

export default SearchArticle