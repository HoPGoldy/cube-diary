import { ChangeEventHandler, useContext, useRef, useState } from 'react'
import { NextPage } from 'next'
import Head from 'next/head'
import { Card, Switch, Form, Space, ActionBar, Cell, Notify, Button, Search, Checkbox, Field, Radio, Rate, Slider, Stepper, Uploader } from 'react-vant'
import { useRouter } from 'next/router'
import { Statistic } from 'components/Statistic'
import { UserConfigContext, UserProfileContext } from '../_app'
import { ArrowDown, ArrowUp, ManagerO, Close, ArrowLeft } from '@react-vant/icons'
import { USER_TOKEN_KEY } from 'lib/constants'
import { useUserProfile } from 'services/user'
import { PageContent, PageAction, ActionButton, ActionIcon } from 'components/PageWithAction'
import ReactMarkdown from 'react-markdown'
import dayjs from 'dayjs'
import { upload } from 'lib/request'

interface JsonImportForm {
    existOperation: string
    dateKey: string
    contentKey: string
    dateFormatter: string
}

const getFormInitialValues = (): JsonImportForm => {
    return { existOperation: 'cover', dateKey: 'date', contentKey: 'content', dateFormatter: 'YYYY-MM-DD' }
}

const createExample = (formValues: JsonImportForm): string => {
    const newExamples = Array.from({ length: 3 }).map((_, index) => {
        const date = dayjs().subtract(index, 'd')
        return {
            [formValues.dateKey || 'date']: formValues.dateFormatter ? date.format(formValues.dateFormatter) : date.valueOf(),
            [formValues.contentKey || 'content']: `这是 ${date.format('YYYY 年 MM 月 DD 日的一篇日记')}`
        }
    })

    return '```json\n' + JSON.stringify(newExamples, null, 2) + '\n```'
}

const DiaryList: NextPage = () => {
    const router = useRouter()
    const { buttonColor } = useContext(UserConfigContext) || {}
    // 当前缓存的用户配置
    const { userProfile, setUserProfile } = useContext(UserProfileContext) || {}
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

    const onFileChange: ChangeEventHandler<HTMLInputElement> = (event) => {
        event.preventDefault()

        const uploadFile = event.target.files?.[0]
        if (!uploadFile) return

        const formValues = form.getFieldsValue()

        upload('/api/import/json', { file: uploadFile, ...formValues })

        // 覆盖掉已经上传的问题，不然第二次上传就会没反应
        event.target.value = '';
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
                <ActionButton color={buttonColor} onClick={onSelectFile}>选择文件并导入</ActionButton>
            </PageAction>
        </div>
    )
}

export default DiaryList