import { ChangeEventHandler, useContext, useRef, useState } from 'react'
import { NextPage } from 'next'
import Head from 'next/head'
import { Card, Dialog, Form, Space, Cell, Field, Notify } from 'react-vant'
import { useRouter } from 'next/router'
import { UserConfigContext, UserProfileContext } from '../_app'
import { ArrowLeft } from '@react-vant/icons'
import { PageContent, PageAction, ActionButton, ActionIcon } from 'components/PageWithAction'
import ReactMarkdown from 'react-markdown'
import dayjs from 'dayjs'
import { DatetimePickerItem } from 'components/DatetimePickerItem'
import { createExample } from 'lib/utils/createExample'
import { JsonExportForm } from '@pages/api/export/json'
import { exportAsJson } from 'services/export'

const getFormInitialValues = (): JsonExportForm => {
    return {
        dateKey: 'date',
        contentKey: 'content',
        dateFormatter: 'YYYY-MM-DD',
        beginDate: dayjs().subtract(1, 'month').format('YYYY-MM-DD'),
        endDate: dayjs().format('YYYY-MM-DD'),
    }
}

const saveAsJson = (data: any, fileName = 'data.json') => {
    const dataStr = JSON.stringify(data)
    const blob = new Blob([dataStr], { type: 'text/json' })
    const a = document.createElement('a')
    a.download = fileName
    a.href = URL.createObjectURL(blob)
    a.dataset.downloadurl = ['text/json', a.download, a.href].join(':')
    a.click()
}

const DiaryList: NextPage = () => {
    const router = useRouter()
    const { buttonColor } = useContext(UserConfigContext) || {}
    // 导入按钮是否载入中
    const [loading, setLoading] = useState(false);
    // 和用户配置项相符的示例
    const [example, setExample] = useState(() => createExample(getFormInitialValues()))
    // 表单实例
    const [form] = Form.useForm<JsonExportForm>()

    const onFormValueChange = (values: Partial<JsonExportForm>, allValues: JsonExportForm) => {
        const newExample = createExample(allValues)
        setExample(newExample)
    }

    const onExport = async () => {
        const config = form.getFieldsValue()
        const resp = await exportAsJson(config)
        console.log('resp', resp)
        saveAsJson({ a: 1, b: 2, c: 3 })
    }

    return (
        <div className="min-h-screen">
            <Head>
                <title>导出为 json</title>
            </Head>

            <PageContent>
                <Space direction="vertical" gap={16} className="w-screen p-4 overflow-y-scroll">
                    <Card round>
                        <Card.Header style={{ justifyContent: 'center' }}>导出为 JSON 文件</Card.Header>
                    </Card>

                    <Card round>
                        <Form
                            colon
                            form={form}
                            onValuesChange={onFormValueChange}
                            inputAlign="right"
                            initialValues={getFormInitialValues()}
                        >
                            <Form.Item name="beginDate" label="开始时间" customField>
                                <DatetimePickerItem placeholder="请选择" />
                            </Form.Item>
                            <Form.Item name="endDate" label="结束时间" customField>
                                <DatetimePickerItem placeholder="请选择" />
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
                        <Cell title="示例" value="将导出的内容格式" />
                        <ReactMarkdown className="overflow-x-auto mx-4">
                            {example}
                        </ReactMarkdown>
                    </Card>
                </Space>
            </PageContent>

            <PageAction>
                <ActionIcon onClick={() => router.back()}>
                    <ArrowLeft fontSize={24} />
                </ActionIcon>
                <ActionButton loading={loading} color={buttonColor} onClick={onExport}>导出</ActionButton>
            </PageAction>
        </div>
    )
}

export default DiaryList