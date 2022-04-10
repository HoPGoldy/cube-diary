import { useContext, useState } from 'react'
import { NextPage } from 'next'
import Head from 'next/head'
import { SettingO, UnderwayO, Search } from '@react-vant/icons'
import { Space, DatetimePicker, Popup } from 'react-vant'
import { useDiaryList } from 'services/diary'
import { DiaryItem } from 'components/DiaryItem'
import { useRouter } from 'next/router'
import dayjs from 'dayjs'
import { UserConfigContext } from '@pages/_app'
import { PageLoading } from 'components/PageLoading'
import { ActionButton, ActionIcon, PageAction, PageContent } from 'components/PageWithAction'

const DiaryList: NextPage = () => {
    const router = useRouter()
    // 获取按钮颜色
    const { buttonColor } = useContext(UserConfigContext) || {}
    // 获取日记列表
    const { data, error } = useDiaryList(router.query.month)
    // 当前点击了哪条日记
    const [clickDiary, setClickDiary] = useState<number | undefined>(undefined)
    // 是否展示日期选择框
    const [showPicker, setShowPicker] = useState(false)
    // 日期选择框的相关数据，防止额外渲染
    // https://3lang3.github.io/react-vant/#/zh-CN/datetime-picker#%E8%AE%BE%E7%BD%AE-mindate-%E6%88%96-maxdate-%E5%90%8E%E5%87%BA%E7%8E%B0%E9%A1%B5%E9%9D%A2%E5%8D%A1%E6%AD%BB%E7%9A%84%E6%83%85%E5%86%B5
    const [dateValue] = useState<{ value: Date, maxDate: Date }>(() => ({
        value: dayjs(router.query.month as string).toDate(),
        maxDate: new Date()
    }))

    const renderDiaryList = () => {
        if (!data && !error) {
            return <PageLoading />
        }

        return (
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
        )
    }

    const onClickWrite = (datetime?: number) => {
        const queryDate = typeof datetime === 'number' ? dayjs(datetime) : dayjs()
        router.push(`/diary/write/${queryDate.format('YYYY-MM-DD')}`)
    }

    const onChoseMonth = (date: Date) => {
        router.push(`/diary/${dayjs(date).format('YYYYMM')}`)
        setShowPicker(false)
    }

    return (
        <div className="min-h-screen">
            <Head>
                <title>日记列表</title>
            </Head>

            <PageContent>
                {renderDiaryList()}
            </PageContent>

            <PageAction>
                <ActionIcon href="/setting" ><SettingO fontSize={24} /></ActionIcon>
                <ActionIcon onClick={() => setShowPicker(true)} ><UnderwayO fontSize={24} /></ActionIcon>
                <ActionIcon onClick={() => console.log('shop click')} ><Search fontSize={24} /></ActionIcon>
                <ActionButton color={buttonColor} onClick={() => onClickWrite()}>写点什么</ActionButton>
            </PageAction>

            <Popup
                round
                visible={showPicker}
                position="bottom"
                onClose={() => setShowPicker(false)}
            >
                <DatetimePicker
                    className="p-4"
                    title="选择要查看的月份"
                    type="year-month"
                    value={dateValue.value}
                    onConfirm={onChoseMonth}
                    onCancel={() => setShowPicker(false)}
                    formatter={(type: string, val: string) => {
                        if (type === 'year') return `${val} 年`
                        if (type === 'month') return `${val} 月`
                        return val
                    }}
                    maxDate={dateValue.maxDate}
                />
            </Popup>
        </div>
    )
}

export default DiaryList