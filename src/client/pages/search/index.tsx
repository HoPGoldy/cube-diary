import React, { FC, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageContent, PageAction, ActionIcon, ActionSearch } from '../../layouts/PageWithAction'
import { Button, Input, List } from 'antd'
import { PAGE_SIZE } from '@/config'
import { DesktopArea } from '@/client/layouts/Responsive'
import { BgColorsOutlined, LeftOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import { PageTitle } from '@/client/components/PageTitle'
import { useSearchDiary } from '@/client/services/diary'
import { DiaryListItem } from '../monthList/listItem'
import { MobileDrawer } from '@/client/components/MobileDrawer'
import { ColorMutiplePicker } from '@/client/components/ColorPicker'
import { messageSuccess } from '@/client/utils/message'

/**
 * 搜索页面
 * 可以通过关键字和标签来搜索笔记
 */
const SearchArticle: FC = () => {
    const navigate = useNavigate()
    /** 搜索关键字 */
    const [keyword, setKeyword] = useState('')
    /** 是否显示颜色选择器 */
    const [showColorPicker, setShowColorPicker] = useState(false)
    /** 当前选中的颜色 */
    const [selectedColor, setSelectedColor] = useState<string[]>([])
    /** 当前分页 */
    const [currentPage, setCurrentPage] = useState(1)
    /** 是否降序排列 */
    const [desc, setDesc] = useState(true)
    // 搜索结果列表
    const { data: diaryListResp, isLoading: isSearching } = useSearchDiary({
        keyword,
        colors: selectedColor,
        desc,
        page: currentPage,
    })
    /** 搜索列表占位文本 */
    const [listEmptyText, setListEmptyText] = useState<string>()

    useEffect(() => {
        if (!listEmptyText) setListEmptyText('输入关键字或选择颜色进行搜索')
        else setListEmptyText('没有找到相关笔记')
    }, [isSearching])

    const onKeywordSearch = (value: string) => {
        setKeyword(value)
        setCurrentPage(1)
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
                    <List
                        loading={isSearching}
                        grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 4 }}
                        dataSource={diaryListResp?.data?.rows || []}
                        renderItem={item => <DiaryListItem item={item} />}
                        locale={{ emptyText: listEmptyText }}
                        pagination={{
                            total: diaryListResp?.data?.total || 0,
                            pageSize: PAGE_SIZE,
                            current: currentPage,
                            onChange: setCurrentPage,
                            align: 'center',
                        }}
                    />
                </div>
            </div>
        )
    }

    return (<>
        <PageTitle title='搜索笔记' />

        <PageContent>
            {renderContent()}
        </PageContent>

        <PageAction>
            <ActionIcon icon={<LeftOutlined />} onClick={() => navigate(-1)} />
            <ActionIcon
                icon={desc ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
                onClick={() => {
                    setDesc(!desc)
                    messageSuccess(desc ? '升序，日期较早的展示在前' : '降序，日期较晚的展示在前')
                }}
            />
            <ActionIcon icon={<BgColorsOutlined />} onClick={() => setShowColorPicker(true)}/>
            <ActionSearch onSearch={onKeywordSearch} />
        </PageAction>

        <MobileDrawer
            title='选择颜色'
            open={showColorPicker}
            onClose={() => setShowColorPicker(false)}
            height="16rem"
            footer={
                <Button
                    block
                    size="large"
                    onClick={() => {
                        setShowColorPicker(false)
                        setSelectedColor([])
                    }}
                >清空</Button>
            }
        >
            <ColorMutiplePicker
                value={selectedColor}
                onChange={setSelectedColor}
            />
        </MobileDrawer>
    </>)
}

export default SearchArticle