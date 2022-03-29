import { useState, ChangeEvent, useRef, useContext } from 'react'
import { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import { ArrowLeft, UnderwayO } from '@react-vant/icons'
import { Card, Space, ActionBar, Notify } from 'react-vant'
import { updateDiary } from 'services/diary'
import dayjs from 'dayjs'
import { useRouter } from 'next/router'
import { UserConfigContext } from '@pages/_app'

interface Props {
    existContent: string
}

const DiaryEdit: NextPage<Props> = (props) => {
    const [content, setContent] = useState(props.existContent)
    const [uploading, setUploading] = useState(false)
    const textAreaRef = useRef<HTMLTextAreaElement>(null)
    const { buttonColor } = useContext(UserConfigContext) || {}
    const router = useRouter()

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
                    <Card.Header>
                    2022 年 3 月 29 日 星期二
                    </Card.Header>
                </Card>

                <Card round>
                    <Card.Body>
                        <textarea
                            ref={textAreaRef}
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

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
    const existContent = '中国老例，凡要排斥异己的时候，常给对手起一个诨名，——或谓之“绰号”。这也是明清以来讼师的老手段;假如要控告张三李四，倘只说姓名，本很平常，现在却道“六臂太岁张三”，“白额虎李四”，则先不问事迹，县官只见绰号，就觉得他们是恶棍了。'

    return {
        props: { existContent }
    }
}

export default DiaryEdit