import { useState, ChangeEvent, useRef, useContext, useMemo, useEffect } from 'react'
import { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import { ArrowLeft, UnderwayO } from '@react-vant/icons'
import { Card, Space, ActionBar, Notify } from 'react-vant'
import { updateDiary, useDiaryDetail } from 'services/diary'
import dayjs from 'dayjs'
import { useRouter } from 'next/router'
import { UserConfigContext } from '@pages/_app'
import { NUMBER_TO_CHINESE } from 'lib/constants'

interface Props {
    existContent: string
}

const DiaryEdit: NextPage<Props> = () => {
    const router = useRouter()

    // 日期查询条件兜底，防止用户输入了无效的日期
    useEffect(() => {
        if (dayjs(router.query.diaryDate as string).isValid()) return
        Notify.show({ type: 'warning', message: '使用了错误的日期，已跳转至今日' })
        router.replace(`/diary/write/${dayjs().format('YYYY-MM-DD')}`)
    }, [router.query.diaryDate])

    // 编辑的正文内容
    const { content, setContent } = useDiaryDetail(router.query.diaryDate)
    // 是否保存中
    const [uploading, setUploading] = useState(false)
    // 文本输入框引用
    const textAreaRef = useRef<HTMLTextAreaElement>(null)
    // 主按钮颜色
    const { buttonColor } = useContext(UserConfigContext) || {}
    // 页面标题日期
    const pageTitle = useMemo(() => {
        const date = dayjs(router.query.diaryDate as string)
        return date.format('YYYY 年 M 月 D 日') + ` 星期${NUMBER_TO_CHINESE[date.day()]}`
    }, [router.query.diaryDate])

    const onContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value)
    }

    const onInsertDate = () => {
        setContent(oldContent => {
            const { selectionStart = 0, selectionEnd = 0 } = textAreaRef.current || {}
            const now = dayjs().format('YYYY 年 MM 月 DD 日 HH:mm:ss')
            const newContent = oldContent.slice(0, selectionStart) + now + oldContent.slice(selectionEnd)
            return newContent
        })

        textAreaRef.current?.focus()
    }

    const onSaveDiary = async () => {
        const { diaryDate } = router.query
        if (typeof diaryDate !== 'string') {
            Notify.show({ type: 'danger', message: '无效的编辑日期' })
            return
        }

        setUploading(true)
        const resp = await updateDiary(diaryDate, content)
        setUploading(false)
        if (!resp.success) {
            Notify.show({ type: 'danger', message: resp.message })
            return
        }

        Notify.show({ type: 'success', message: '保存成功' })
        router.push(`/diary/${dayjs(diaryDate).format('YYYYMM')}`)
    }

    return (
        <div className="min-h-screen">
            <Head>
                <title>日记编辑</title>
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Space direction="vertical" gap={12} className="w-screen p-3 overflow-y-scroll">
                <Card round>
                    <Card.Header>{pageTitle}</Card.Header>
                </Card>

                <Card round>
                    <Card.Body>
                        <textarea
                            ref={textAreaRef}
                            placeholder="写点什么"
                            autoFocus
                            className="w-full"
                            style={{ height: 'calc(100vh - var(--rv-action-bar-height) - 116px)', resize: 'none' }}
                            value={content}
                            onChange={onContentChange}
                        />
                    </Card.Body>
                </Card>
            </Space>

            <ActionBar>
                <ActionBar.Icon icon={<ArrowLeft />} text="返回" onClick={() => router.back()} />
                <ActionBar.Icon icon={<UnderwayO />} text="时间" onClick={onInsertDate} />
                <ActionBar.Button loading={uploading} color={buttonColor} text="保存" onClick={onSaveDiary} />
            </ActionBar>
        </div>
    )
}

export default DiaryEdit
