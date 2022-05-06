import { useState, useRef, useMemo, useEffect, RefObject } from 'react'
import { NextPage } from 'next'
import Head from 'next/head'
import { ArrowLeft, PhotoO, UnderwayO } from '@react-vant/icons'
import { Card, Space, Notify } from 'react-vant'
import { updateDiary, useDiaryDetail } from 'services/diary'
import dayjs from 'dayjs'
import { useRouter } from 'next/router'
import { WEEK_TO_CHINESE } from 'lib/constants'
import { PageLoading } from 'components/PageLoading'
import { PageContent, PageAction, ActionIcon, ActionButton } from 'components/PageWithAction'
import { Accessory, EditUploader, EditUploaderRef } from 'components/EditUploader'

/**
 * 自动保存 hook
 * 将每隔一段时间自动将内容提交到后端，并把保存结果返回出去
 */
const useAutoSave = function (contentRef: RefObject<string>, uploaderRef: RefObject<EditUploaderRef>) {
    const router = useRouter()
    const [autoSaveTip, setAutoSaveTip] = useState('')

    useEffect(() => {
        const timer = setInterval(async () => {
            const content = contentRef.current
            if (!content || content.length <= 0) return

            const { diaryDate } = router.query
            const accessorys = uploaderRef.current?.getFiles()
            const resp = await updateDiary(diaryDate as string, content, accessorys)
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
    const { content, contentLoading, contentRef, accessoryRef, setContent } = useDiaryDetail(router.query.diaryDate)
    // 是否保存中
    const [uploading, setUploading] = useState(false)
    // 文本输入框引用
    const textAreaRef = useRef<HTMLTextAreaElement>(null)
    // 附件组件引用
    const uploaderRef = useRef<EditUploaderRef>(null)
    // 是否展示附件上传弹出框
    const [showUploader, setShowUploader] = useState(false)

    // 加载完成后将光标放在文章末尾
    useEffect(() => {
        if (contentLoading) return
        textAreaRef.current?.setSelectionRange(contentRef.current.length, contentRef.current.length)

        const newFiles = accessoryRef.current.map(f => ({ ...f, isImage: true }))
        uploaderRef.current?.setFiles(newFiles)
    }, [contentLoading])

    // 页面标题日期
    const pageTitle = useMemo(() => {
        const date = dayjs(router.query.diaryDate as string)
        return date.format('YYYY 年 M 月 D 日') + ` ${WEEK_TO_CHINESE[date.day()]}`
    }, [router.query.diaryDate])

    const autoSaveTip = useAutoSave(contentRef, uploaderRef)

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
     * 插入图片
     */
    const onInsertPhoto = (accessorys: Accessory[]) => {
        setContent(oldContent => {
            const { selectionStart = 0, selectionEnd = 0 } = textAreaRef.current || {}
            // 把所有新图片转换为 markdown 图片字符串
            const newInsertContent = '\n' + accessorys.map(f => `\n![${f.name.split('.')[0]}](${f.url})\n`).join('') + '\n'
            const newContent = oldContent.slice(0, selectionStart) + newInsertContent + oldContent.slice(selectionEnd)
            return newContent
        })

        setShowUploader(false)
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

        const accessorys = uploaderRef.current?.getFiles()

        setUploading(true)
        const resp = await updateDiary(diaryDate, content, accessorys)
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
                className="w-full bg-cardBackground"
                style={{ height: 'calc(100vh - 186px)', resize: 'none' }}
                value={content}
                onChange={e => setContent(e.target.value)}
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
                <Space direction="vertical" gap={16} className="w-screen p-4 pb-0 overflow-y-scroll text-mainColor">
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
                <ActionIcon onClick={() => setShowUploader(true)}>
                    <PhotoO fontSize={24} />
                </ActionIcon>
                <ActionButton onClick={onSaveDiary} loading={uploading}>
                    保存
                    <span className="ml-2 text-xs">{autoSaveTip}</span>
                </ActionButton>
            </PageAction>

            <EditUploader
                ref={uploaderRef}
                visible={showUploader}
                onClose={() => setShowUploader(false)}
                onInsert={onInsertPhoto}
            />
        </div>
    )
}

export default DiaryEdit
