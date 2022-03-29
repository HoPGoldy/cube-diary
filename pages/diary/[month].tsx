import { useState } from 'react'
import { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import { SettingO, UnderwayO, Search, Edit } from '@react-vant/icons';
import { Loading, Button, Toast, Space, ActionBar, Tag } from 'react-vant';
import { useDiaryList } from 'services/diary';
import { getDiaryConfig } from 'lib/loadConfig';
import { DiaryItem } from 'components/DiaryItem';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';

interface Props {
    buttonColor: string
}

const DiaryList: NextPage<Props> = (props) => {
    const { buttonColor } = props
    const router = useRouter()
    const { data, error } = useDiaryList(router.query.month)
    const [clickDiary, setClickDiary] = useState<number | undefined>(undefined);

    const renderDiaryList = () => {
        if (!data && !error) {
            return <Loading className="mt-24" color="#3f45ff" size="48px" vertical>加载中...</Loading>
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
                <ActionBar.Icon icon={<SettingO />} text="设置" onClick={() => console.log('chat click')} />
                <ActionBar.Icon icon={<UnderwayO />} text="时间" onClick={() => console.log('cart click')} />
                <ActionBar.Icon icon={<Search />} text="搜索" onClick={() => console.log('shop click')} />
                <ActionBar.Button color={buttonColor} text="写点东西" onClick={onClickWrite} />
            </ActionBar>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
    const config = await getDiaryConfig()

    if (!config) return {
        redirect: { statusCode: 302, destination: '/error/NO_CONFIG' }
    }

    const { writeDiaryButtonColors } = config
    const randIndex = Math.floor(Math.random() * (writeDiaryButtonColors?.length))

    return {
        props: { buttonColor: writeDiaryButtonColors[randIndex] }
    }
}

export default DiaryList