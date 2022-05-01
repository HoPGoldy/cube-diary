import { ChangeEventHandler, useRef, useState } from 'react'
import { NextPage } from 'next'
import Head from 'next/head'
import { Card, Dialog, Form, Space, Cell, Field, Radio, Notify } from 'react-vant'
import { useRouter } from 'next/router'
import { ArrowLeft } from '@react-vant/icons'
import { PageContent, PageAction, ActionButton, ActionIcon } from 'components/PageWithAction'
import ReactMarkdown from 'react-markdown'
import { upload } from 'lib/request'
import { JsonImportForm, JsonImportResult } from '@pages/api/import/json'
import { createExample } from 'lib/utils/createExample'

const getFormInitialValues = (): JsonImportForm => {
    return { existOperation: 'cover', dateKey: 'date', contentKey: 'content', dateFormatter: 'YYYY-MM-DD' }
}

const DiaryList: NextPage = () => {
    const router = useRouter()
    // 导入按钮是否载入中
    const [loading, setLoading] = useState(false)
    // 和用户配置项相符的示例
    const [example, setExample] = useState(() => createExample(getFormInitialValues()))

    const [form] = Form.useForm<JsonImportForm>()

    const fileSelectRef = useRef<HTMLInputElement>(null)

    const onSelectFile = () => {
        fileSelectRef.current?.click()
    }

    const onFormValueChange = (values: Partial<JsonImportForm>, allValues: JsonImportForm) => {
        const newExample = createExample(allValues)
        setExample(newExample)
    }

    const onFileChange: ChangeEventHandler<HTMLInputElement> = async (event) => {
        event.preventDefault()

        const uploadFile = event.target.files?.[0]
        if (!uploadFile) return

        const formValues = form.getFieldsValue()

        // 覆盖掉已经上传的问题，不然第二次上传就会没反应
        event.target.value = '';

        setLoading(true)
        const resp = await upload<JsonImportResult>('/api/import/json', { file: uploadFile, ...formValues })
        setLoading(false)
        if (!resp.success) return Notify.show({ type: 'danger', message: resp.message });

        const { existCount = 0, insertCount = 0, insertNumber = 0} = resp.data || {}

        await Dialog.confirm({
            title: <b>导入成功</b>,
            message: (
                <div className="text-left">
                    <div className="pb-4">
                        共计导入 {existCount + insertCount} 条，{insertNumber >= 0 ? '新增' : '减少'} {insertNumber} 字，其中：
                    </div>
                    <li>新增 {insertCount} 条</li>
                    <li>更新 {existCount} 条</li>
                    <div className="pt-4">可通过备份管理中的 “导入备份” 恢复到导入前的状态</div>
                </div>
            ),
            className: 'text-mainColor',
            cancelButtonText: '继续导入',
            confirmButtonText: '返回首页'
        })

        router.push('/')
    }

    return (
        <div className="min-h-screen">
            <Head>
                <title>导入 json</title>
            </Head>

            <PageContent>
                <Space direction="vertical" gap={16} className="w-screen p-4 overflow-y-scroll">
                    <Card round>
                        <Card.Header style={{ justifyContent: 'center' }}>从 JSON 文件导入</Card.Header>
                    </Card>

                    <Card round>
                        <Form
                            colon
                            form={form}
                            onValuesChange={onFormValueChange}
                            inputAlign="right"
                            initialValues={getFormInitialValues()}
                        >
                            <Form.Item name="existOperation" label="当存在日记时" labelWidth="8rem">
                                <Radio.Group direction="horizontal">
                                    <Radio name="cover">覆盖</Radio>
                                    <Radio name="merge">合并</Radio>
                                </Radio.Group>
                            </Form.Item>
                            <Form.Item name="dateKey" label="日期字段名">
                                <Field placeholder="默认使用 date" />
                            </Form.Item>
                            <Form.Item name="dateFormatter" label="日期解析">
                                <Field placeholder="默认解析 UNIX 毫秒时间戳" />
                            </Form.Item>
                            <Form.Item name="contentKey" label="正文字段名">
                                <Field placeholder="默认使用 content" />
                            </Form.Item>
                        </Form>
                    </Card>

                    <Card round>
                        <Cell title="示例" value="可识别的内容" />
                        <ReactMarkdown className="overflow-x-auto mx-4">
                            {example}
                        </ReactMarkdown>
                    </Card>

                    <input
                        type="file"
                        ref={fileSelectRef}
                        accept=".json"
                        style={{ display: 'none' }}
                        onChange={onFileChange}
                    ></input>

                </Space>
            </PageContent>

            <PageAction>
                <ActionIcon onClick={() => router.back()}>
                    <ArrowLeft fontSize={24} />
                </ActionIcon>
                <ActionButton loading={loading} onClick={onSelectFile}>选择文件并导入</ActionButton>
            </PageAction>
        </div>
    )
}

export default DiaryList