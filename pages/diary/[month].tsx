import { useContext, useState } from 'react'
import { NextPage } from 'next'
import Head from 'next/head'
import { SettingO, UnderwayO, Search } from '@react-vant/icons'
import { Space, ActionBar } from 'react-vant'
import { useDiaryList } from 'services/diary'
import { DiaryItem } from 'components/DiaryItem'
import { useRouter } from 'next/router'
import dayjs from 'dayjs'
import Link from 'components/Link'
import { UserConfigContext } from '@pages/_app'
import { PageLoading } from 'components/PageLoading'

const DiaryList: NextPage = () => {
    const router = useRouter()
    const { buttonColor } = useContext(UserConfigContext) || {}
    const { data, error } = useDiaryList(router.query.month)
    const [clickDiary, setClickDiary] = useState<number | undefined>(undefined)

    const renderDiaryList = () => {
        if (!data && !error) {
            return <PageLoading />
        }

        return (
            <Space
                direction="vertical"
                className="m-4"
                gap={16}
            >
                {data?.data?.entries.map((diary, index) => {
                    return <DiaryItem
                        key={diary.date}
                        diary={diary}
                        onClickBody={() => setClickDiary(clickDiary === index ? undefined : index)}
                        showInteract={index === clickDiary}
                    />
                })}
                <div className="h-9"></div>
            </Space>
        )
    }

    const onClickWrite = () => {
        router.push(`/diary/write/${dayjs().format('YYYY-MM-DD')}`)
    }

    return (
        <div className="min-h-screen">
            <Head>
                <title>日记列表</title>
            </Head>

            {renderDiaryList()}

            <ActionBar>
                <Link href="/setting">
                    <ActionBar.Icon icon={<SettingO />} text="设置" />
                </Link>
                <ActionBar.Icon icon={<UnderwayO />} text="时间" onClick={() => console.log('cart click')} />
                <ActionBar.Icon icon={<Search />} text="搜索" onClick={() => console.log('shop click')} />
                <ActionBar.Button color={buttonColor} text="写点东西" onClick={onClickWrite} />
            </ActionBar>
        </div>
    )
}

export default DiaryList