import React, { FC, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageContent, PageAction, ActionIcon, ActionButton } from '../../layouts/pageWithAction'
import { Button, Card, Col, DatePicker, Form, Input, Radio, Row, message } from 'antd'
import { DesktopArea, MobileArea } from '@/client/layouts/responsive'
import { LeftOutlined } from '@ant-design/icons'
import { PageTitle } from '@/client/components/pageTitle'
import { useExportDiary } from '@/client/services/diary'
import s from './styles.module.css'

import dayjs, { Dayjs } from 'dayjs'
import { DiaryExportReqData } from '@/types/diary'
import Preview from '../monthList/preview'

type JsonExportForm = Omit<DiaryExportReqData, 'startDate' | 'endDate'> & {
    startDate: Dayjs
    endDate: Dayjs
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

/**
 * 为导入导出 json 创建示例
 */
const createExample = (formValues: JsonExportForm): string => {
    const newExamples = Array.from({ length: 3 }).map((_, index) => {
        const date = dayjs().subtract(index, 'd').startOf('day')
        return {
            [formValues.dateKey || 'date']: formValues.dateFormatter ? date.format(formValues.dateFormatter) : date.valueOf(),
            [formValues.contentKey || 'content']: `这是 ${date.format('YYYY 年 MM 月 DD 日的一篇日记')}`,
            [formValues.colorKey || 'color']: `c0${index + 1}`
        }
    })

    return '```json\n' + JSON.stringify(newExamples, null, 2) + '\n```'
}

const getFormInitialValues = (): JsonExportForm => {
    return {
        range: 'part',
        startDate: dayjs().subtract(1, 'month'),
        endDate: dayjs(),
        dateKey: 'date',
        contentKey: 'content',
        colorKey: 'color',
        dateFormatter: 'YYYY-MM-DD'
    }
}

const initialValues = getFormInitialValues()

/**
 * 导出日记页面
 */
const ExportDiary: FC = () => {
    const navigate = useNavigate()
    const [form] = Form.useForm()
    /** 和用户配置项相符的示例 */
    const [example, setExample] = useState(() => createExample(getFormInitialValues()))
    /** 上传接口 */
    const { mutateAsync: exportJson, isLoading } = useExportDiary()
    /** 导入中提示 */
    const [messageApi, contextHolder] = message.useMessage()
    /** 是否为范围导出 */
    const isRangeExport = Form.useWatch('range', form) === 'part'

    const onFormValueChange = (values: Partial<JsonExportForm>, allValues: JsonExportForm) => {
        const newExample = createExample(allValues)
        setExample(newExample)
    }

    const onExport = async () => {
        const values = await form.validateFields()
        const { startDate, endDate, ...rest } = values
        const reqData: DiaryExportReqData = { ...rest }

        if (reqData.range === 'part') {
            reqData.startDate = startDate.format('YYYY-MM-DD')
            reqData.endDate = endDate.format('YYYY-MM-DD')
        }

        messageApi.loading('导出中，请不要关闭页面...', 0)
        const resp = await exportJson(reqData)
        messageApi.destroy()
        saveAsJson(resp, 'diary.json')
    }

    const renderContent = () => {
        return (
            <div className='p-4'>
                {contextHolder}
                <MobileArea>
                    <Card size="small" className="mb-4">
                        <div className="text-center font-black">日记导出</div>
                    </Card>
                </MobileArea>
                
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={24} lg={12}>
                        <Card size="small" className="mb-4" title="导出配置">
                            <Form
                                className={s.importDiaryBox}
                                form={form}
                                initialValues={initialValues}
                                onValuesChange={onFormValueChange}
                                labelAlign='left'
                            >
                                <Row gutter={[16, 16]}>
                                    <Col span={9}>
                                        导出范围
                                    </Col>
                                    <Col span={15}>
                                        <Form.Item name="range" noStyle>
                                            <Radio.Group className="float-right">
                                                <Radio value="all">全部</Radio>
                                                <Radio value="part">部分</Radio>
                                            </Radio.Group>
                                        </Form.Item>
                                    </Col>
                                    {isRangeExport && (<>
                                        <Col span={9}>
                                            开始日期
                                        </Col>
                                        <Col span={15}>
                                            <Form.Item name="startDate" noStyle rules={[{ required: true, message: '请选择开始日期'}]}>
                                                <DatePicker className="w-full" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={9}>
                                            结束日期
                                        </Col>
                                        <Col span={15}>
                                            <Form.Item name="endDate" noStyle rules={[{ required: true, message: '请选择结束日期'}]}>
                                                <DatePicker className="w-full" />
                                            </Form.Item>
                                        </Col>
                                    </>)}
                                    <Col span={9}>
                                        日期字段名
                                    </Col>
                                    <Col span={15}>
                                        <Form.Item name="dateKey" noStyle>
                                            <Input placeholder="默认使用 date" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={9}>
                                        日期解析
                                    </Col>
                                    <Col span={15}>
                                        <Form.Item name="dateFormatter" noStyle>
                                            <Input placeholder="默认解析毫秒时间戳" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={9}>
                                        正文字段名
                                    </Col>
                                    <Col span={15}>
                                        <Form.Item name="contentKey" noStyle>
                                            <Input placeholder="默认使用 content" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={9}>
                                        颜色字段名
                                    </Col>
                                    <Col span={15}>
                                        <Form.Item name="colorKey" noStyle>
                                            <Input placeholder="默认使用 color" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Form>
                        </Card>
                        <DesktopArea>
                            <Button
                                block
                                type="primary"
                                onClick={onExport}
                                loading={isLoading}
                            >导出</Button>
                        </DesktopArea>
                    </Col>

                    <Col xs={24} md={24} lg={12}>
                        <Card size="small" className={s.previewArea} title="示例" extra="将导出为以下格式">
                            <Preview value={example}></Preview>
                        </Card>
                    </Col>
                </Row>
            </div>
        )
    }

    return (<>
        <PageTitle title='日记导出' />

        <PageContent>
            {renderContent()}
        </PageContent>

        <PageAction>
            <ActionIcon
                icon={<LeftOutlined />}
                onClick={() => navigate(-1)}
            />
            <ActionButton
                onClick={onExport}
                loading={isLoading}
            >导出</ActionButton>
        </PageAction>
    </>)
}

export default ExportDiary