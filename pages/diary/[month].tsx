import { useEffect, useRef, useState } from 'react'
import { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import { SettingO, UnderwayO, Search } from '@react-vant/icons'
import { Space } from 'react-vant'
import { useDiaryList } from 'services/diary'
import { DiaryItem } from 'components/DiaryItem'
import { useRouter } from 'next/router'
import dayjs from 'dayjs'
import { PageLoading } from 'components/PageLoading'
import { ActionButton, ActionIcon, PageAction, PageContent } from 'components/PageWithAction'
import { PullContainer } from 'components/PullContainer'
import { MonthPicker } from 'components/MonthPicker'
import nookies from 'nookies'
import { USER_TOKEN_KEY } from 'lib/constants'
import { verifyAuth } from 'lib/auth'

const DiaryList: NextPage = () => {
    const router = useRouter()
    // 获取日记列表
    const { data, error } = useDiaryList(router.query.month)
    // 当前点击了哪条日记
    const [clickDiary, setClickDiary] = useState<number | undefined>(undefined)
    // 是否展示日期选择框
    const [showPicker, setShowPicker] = useState(false)

    // 列表底部 div 引用
    const listBottomRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        if (!data?.data?.entries || data.data.entries.length <= 0) return
        // 到本月了才会触发滚动到底部
        // 不然在用户往上个月切换的时候，会出现回到底部的情况，不方便重复切换操作
        if (dayjs(router.query.month as string).month() !== new Date().getMonth()) return
        listBottomRef.current?.scrollIntoView()
    }, [data])

    const renderDiaryList = () => {
        if (!data && !error) {
            return <PageLoading />
        }

        return (
            <PullContainer>
                <Space
                    direction="vertical"
                    className="w-full p-4 pb-0"
                    gap={16}
                >
                    {data?.data?.entries.map((diary, index) => {
                        return <DiaryItem
                            key={diary.date}
                            diary={diary}
                            // onClickBody={() => setClickDiary(clickDiary === index ? undefined : index)}
                            onClickBody={() => onClickWrite(diary.date)}
                            showInteract={index === clickDiary}
                        />
                    })}
                </Space>
            </PullContainer>
        )
    }

    const onClickWrite = (datetime?: number) => {
        const queryDate = typeof datetime === 'number' ? dayjs(datetime) : dayjs()
        router.push(`/diary/write/${queryDate.format('YYYY-MM-DD')}`)
    }

    return (
        <div className="min-h-screen">
            <Head>
                <title>日记列表</title>
            </Head>

            <PageContent>
                {renderDiaryList()}
                <div ref={listBottomRef}></div>
            </PageContent>

            <PageAction>
                <ActionIcon href="/setting">
                    <SettingO fontSize={24} />
                </ActionIcon>
                <ActionIcon onClick={() => setShowPicker(true)}>
                    <UnderwayO fontSize={24} />
                </ActionIcon>
                <ActionIcon href="/search">
                    <Search fontSize={24} />
                </ActionIcon>
                <ActionButton onClick={() => onClickWrite()}>
                    写点什么
                </ActionButton>
            </PageAction>

            <MonthPicker
                visible={showPicker}
                onClose={() => setShowPicker(false)}
            />
        </div>
    )
}

export default DiaryList