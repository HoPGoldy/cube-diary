import { useContext } from 'react'
import { NextPage } from 'next'
import Head from 'next/head'
import { Card, Switch, Form, Space, ActionBar, Tag, Notify } from 'react-vant'
import { useRouter } from 'next/router'
import dayjs from 'dayjs'
import { Statistic } from 'components/Statistic'
import { UserConfigContext } from './_app'
import { ArrowLeft } from '@react-vant/icons'

const DiaryList: NextPage = () => {
    const router = useRouter()
    const { buttonColor } = useContext(UserConfigContext) || {}
    
    const [form] = Form.useForm();

    const onFinish = () => {

    };

    const onSaveSetting = () => {
        router.back()
        Notify.show({ type: 'success', message: '设置已保存' })
    }

    return (
        <div className="min-h-screen">
            <Head>
                <title>日记设置</title>
            </Head>

            <Space direction="vertical" gap={12} className="w-screen p-3 overflow-y-scroll">
                <Card round>
                    <Card.Body>
                        <div className="flex flex-row justify-around">
                            <Statistic label="累计日记" value={983} />
                            <Statistic label="累计字数" value={155351} />
                        </div>
                    </Card.Body>
                </Card>

                <Card round>
                    <Card.Body>
                        <Form
                            form={form}
                            onFinish={onFinish}
                        >
                            <Form.Item name="switch" label="开关" valuePropName="checked" inputAlign="right">
                                <Switch size={20} />
                            </Form.Item>
                            <Form.Item name="switch" label="开关" valuePropName="checked" inputAlign="right">
                                <Switch size={20} />
                            </Form.Item>
                            <Form.Item name="switch" label="开关" valuePropName="checked" inputAlign="right">
                                <Switch size={20} />
                            </Form.Item>
                        </Form>
                    </Card.Body>
                </Card>
            </Space>

            <ActionBar>
                <ActionBar.Button color={buttonColor} text="保存" onClick={onSaveSetting} />
            </ActionBar>
        </div>
    )
}

export default DiaryList