import { useState } from 'react'
import { NextPage } from 'next'
import Head from 'next/head'
import { Card, Dialog, Form, Space, Cell, Field, Notify, Radio } from 'react-vant'
import { useRouter } from 'next/router'
import { ArrowLeft } from '@react-vant/icons'
import { PageContent, PageAction, ActionButton, ActionIcon } from 'components/PageWithAction'
import ReactMarkdown from 'react-markdown'
import dayjs from 'dayjs'
import { DatetimePickerItem } from 'components/DatetimePickerItem'
import { createExample } from 'lib/utils/createExample'
import { JsonExportForm } from '@pages/api/export/json'
import { exportAsJson } from 'services/export'

enum RangeType { Part = 1, All }

type FilterForm = JsonExportForm & {
    rangeType: RangeType
}

const getFormInitialValues = (): FilterForm => {
    return {
        rangeType: RangeType.Part,
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
    // 导入按钮是否载入中
    const [loading, setLoading] = useState(false);
    // 和用户配置项相符的示例
    const [example, setExample] = useState(() => createExample(getFormInitialValues()))
    // 查询表单
    const [formData, setFormData] = useState(() => getFormInitialValues())

    const onFormValueChange = (values: Partial<FilterForm>, allValues: FilterForm) => {
        const newExample = createExample(allValues)
        setExample(newExample)
        setFormData(allValues)
    }

    const onExport = async () => {
        const config = { ...formData }
        if (config.rangeType === RangeType.All) {
            delete config.beginDate
            delete config.endDate
        }

        setLoading(true)
        const resp = await exportAsJson(config)
        setLoading(false)
        if (!resp.success) return Notify.show({ type: 'danger', message: resp.message })

        saveAsJson(resp.data)

        await Dialog.confirm({
            title: '导出完成',
            message: `共计导出 ${resp.data?.length} 条`,
            // messageAlign: 'left',
            cancelButtonText: '继续导出',
            confirmButtonText: '返回首页'
        })

        router.push('/')
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
                            inputAlign="right"
                            onValuesChange={onFormValueChange}
                            initialValues={getFormInitialValues()}
                        >
                            <Form.Item name="rangeType" label="导出范围" labelWidth="8rem">
                                <Radio.Group direction="horizontal">
                                    <Radio name={RangeType.All}>全部</Radio>
                                    <Radio name={RangeType.Part}>部分</Radio>
                                </Radio.Group>
                            </Form.Item>
                            {formData.rangeType === RangeType.Part && <>
                                <Form.Item name="beginDate" label="开始时间" customField>
                                    <DatetimePickerItem placeholder="请选择" />
                                </Form.Item>
                                <Form.Item name="endDate" label="结束时间" customField>
                                    <DatetimePickerItem placeholder="请选择" />
                                </Form.Item>
                            </>}
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
                <ActionButton loading={loading} onClick={onExport}>导出</ActionButton>
            </PageAction>
        </div>
    )
}

export default DiaryList