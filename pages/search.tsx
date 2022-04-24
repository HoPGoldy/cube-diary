import { useState } from 'react'
import { NextPage } from 'next'
import Head from 'next/head'
import { ArrowLeft, Down } from '@react-vant/icons'
import { Space, List, Notify } from 'react-vant'
import { DiaryItem } from 'components/DiaryItem'
import { useRouter } from 'next/router'
import dayjs from 'dayjs'
import { PageLoading } from 'components/PageLoading'
import { ActionIcon, ActionSearch, PageAction, PageContent } from 'components/PageWithAction'
import { useDiarySearch } from 'services/search'

const DiaryList: NextPage = () => {
    const router = useRouter()
    // 搜索内容
    const [searchValue, setSearchValue] = useState('')
    // 是否降序排列
    const [desc, setDesc] = useState(true)
    // 引入列表懒加载功能
    const { diaryList, diaryLoadFinish, diaryLoading, onLoadMore } = useDiarySearch(searchValue, desc)

    // 回调 - 切换排序方式
    const onClickSort = () => {
        Notify.show({ type: 'primary', message: desc ? '升序，日期较早的展示在前' : '降序，日期较晚的展示在前' })
        setDesc(!desc)
    }

    const renderDiaryList = () => {
        if (diaryList.length <= 0 && diaryLoading) {
            return <PageLoading />
        }
        if (diaryList.length <= 0) {
            return (
                <div className="text-center mt-16 text-gray-400">
                    {searchValue.length > 0
                        ? '暂无内容，请换一个关键词试试'
                        : '输入关键词以进行搜索'}
                </div>
            )
        }

        return (
            <List loading={diaryLoading} finished={diaryLoadFinish} onLoad={onLoadMore}>
                <Space
                    direction="vertical"
                    className="w-full p-4 pb-0"
                    gap={16}
                >
                    {diaryList.map((diary, index) => {
                        return <DiaryItem
                            dateFormatter="YYYY 年 MM 月 DD 日"
                            className="p-4"
                            key={diary.date}
                            diary={diary}
                            onClickBody={() => onClickWrite(diary.date)}
                        />
                    })}
                </Space>
            </List>
        )
    }

    const onClickWrite = (datetime?: number) => {
        const queryDate = typeof datetime === 'number' ? dayjs(datetime) : dayjs()
        router.push(`/diary/write/${queryDate.format('YYYY-MM-DD')}`)
    }

    return (
        <div className="min-h-screen">
            <Head>
                <title>日记搜索</title>
            </Head>

            <PageContent>
                {renderDiaryList()}
            </PageContent>

            <PageAction>
                <ActionIcon onClick={() => router.back()}>
                    <ArrowLeft fontSize={24} />
                </ActionIcon>
                <ActionIcon onClick={onClickSort}>
                    <Down fontSize={24} rotate={desc ? 0 : 180} />
                </ActionIcon>
                <ActionSearch autoFocus onSearch={setSearchValue} />
            </PageAction>
        </div>
    )
}

export default DiaryList