import { useState, useRef, useContext, useMemo, useEffect, MutableRefObject } from 'react'
import { NextPage } from 'next'
import Head from 'next/head'
import { ArrowLeft, SettingO, UnderwayO } from '@react-vant/icons'
import { Card, Space, ActionBar, Notify, Search } from 'react-vant'
import { updateDiary, useDiaryDetail } from 'services/diary'
import dayjs from 'dayjs'
import { useRouter } from 'next/router'
import { UserConfigContext } from '@pages/_app'
import { WEEK_TO_CHINESE } from 'lib/constants'
import { PageLoading } from 'components/PageLoading'
import { PageContent, PageAction, ActionIcon, ActionButton } from 'components/PageWithAction'

/**
 * 自动保存 hook
 * 将每隔一段时间自动将内容提交到后端，并把保存结果返回出去
 */
const useAutoSave = function (contentRef: MutableRefObject<string>) {
    const router = useRouter()
    const [autoSaveTip, setAutoSaveTip] = useState('')

    useEffect(() => {
        const timer = setInterval(async () => {
            const content = contentRef.current
            if (!content || content.length <= 0) return

            const { diaryDate } = router.query
            const resp = await updateDiary(diaryDate as string, content)
            if (!resp.success) {
                setAutoSaveTip('自动保存失败')
                return
            }
            setAutoSaveTip(`自动保存于 ${dayjs().format('HH:mm')}`)
        }, 20 * 1000)

        return () => clearInterval(timer)
    }, [router.query.diaryDate])

    return autoSaveTip
}

const DiaryEdit: NextPage = () => {
    const router = useRouter()

    // 日期查询条件兜底，防止用户输入了无效的日期
    useEffect(() => {
        if (dayjs(router.query.diaryDate as string).isValid()) return
        Notify.show({ type: 'warning', message: '使用了错误的日期，已跳转至今日' })
        router.replace(`/diary/write/${dayjs().format('YYYY-MM-DD')}`)
    }, [router.query.diaryDate])

    // 编辑的正文内容
    const { content, contentLoading, contentRef, setContent } = useDiaryDetail(router.query.diaryDate)
    // 是否保存中
    const [uploading, setUploading] = useState(false)
    // 文本输入框引用
    const textAreaRef = useRef<HTMLTextAreaElement>(null)
    // 加载完成后将光标放在文章末尾
    useEffect(() => {
        if (contentLoading) return
        textAreaRef.current?.setSelectionRange(contentRef.current.length, contentRef.current.length)
    }, [contentLoading])
    // 主按钮颜色
    const { buttonColor } = useContext(UserConfigContext) || {}
    // 页面标题日期
    const pageTitle = useMemo(() => {
        const date = dayjs(router.query.diaryDate as string)
        return date.format('YYYY 年 M 月 D 日') + ` ${WEEK_TO_CHINESE[date.day()]}`
    }, [router.query.diaryDate])

    const autoSaveTip = useAutoSave(contentRef)

    /**
     * 点击插入时间按钮
     */
    const onInsertDate = () => {
        setContent(oldContent => {
            const { selectionStart = 0, selectionEnd = 0 } = textAreaRef.current || {}
            const now = dayjs().format('YYYY 年 MM 月 DD 日 HH:mm:ss')
            const newContent = oldContent.slice(0, selectionStart) + now + oldContent.slice(selectionEnd)
            return newContent
        })

        textAreaRef.current?.focus()
    }

    /**
     * 点击保存按钮
     */
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

    /**
     * 点击返回按钮
     */
    const onClickCancel = async () => {
        if (!content || content.length <= 0) {
            router.back()
            return
        }
        onSaveDiary()
    }

    /**
     * 渲染正文区域
     */
    const renderContent = () => {
        if (contentLoading) return <PageLoading />

        return (
            <textarea
                ref={textAreaRef}
                placeholder="写点什么"
                autoFocus
                className="w-full"
                style={{ height: 'calc(100vh - 186px)', resize: 'none' }}
                value={content}
                onChange={e => setContent(e.target.value)}
            />
        )
    }

    const renderSaveButton = () => {
        return (
            <ActionBar.Button
                loading={uploading}
                color={buttonColor}
                text={(<>
                    保存
                    <span className="ml-4 text-xs">{autoSaveTip}</span>
                </>)}
                onClick={onSaveDiary}
            />
        )
    }

    return (
        <div className="min-h-screen">
            <Head>
                <title>日记编辑</title>
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <PageContent>
                <Space direction="vertical" gap={16} className="w-screen p-4 pb-0 overflow-y-scroll">
                    <Card round>
                        <Card.Header>{pageTitle}</Card.Header>
                    </Card>

                    <Card round>
                        <Card.Body>
                            {renderContent()}
                        </Card.Body>
                    </Card>
                </Space>
            </PageContent>

            <PageAction>
                <ActionIcon onClick={onClickCancel}>
                    <ArrowLeft fontSize={24} />
                </ActionIcon>
                <ActionIcon onClick={onInsertDate}>
                    <UnderwayO fontSize={24} />
                </ActionIcon>
                <ActionButton color={buttonColor} onClick={onSaveDiary}>
                    保存
                    <span className="ml-2 text-xs">{autoSaveTip}</span>
                </ActionButton>
            </PageAction>

            {/* <ActionBar>
                <ActionBar.Icon icon={<ArrowLeft />} text="返回" onClick={onClickCancel} />
                <ActionBar.Icon icon={<UnderwayO />} text="时间" onClick={onInsertDate} />
                {renderSaveButton()}
            </ActionBar> */}
        </div>
    )
}

export default DiaryEdit
