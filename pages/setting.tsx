import { useState } from 'react'
import { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import { SettingO, UnderwayO, Search, Edit } from '@react-vant/icons';
import { Card, Switch, Form, Space, ActionBar, Tag } from 'react-vant';
import { useDiaryList } from 'services/diary';
import { getDiaryConfig } from 'lib/loadConfig';
import { DiaryItem } from 'components/DiaryItem';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';

interface Props {
    buttonColor: string
}

const DiaryList: NextPage<Props> = (props) => {
    const { buttonColor } = props
    const router = useRouter()
    
    const [form] = Form.useForm();

    const onFinish = () => {

    };

    const onClickWrite = () => {
        router.push(`/diary/write/${dayjs().format('YYYY-MM-DD')}`)
    }

    return (
        <div className="min-h-screen">
            <Head>
                <title>日记设置</title>
            </Head>

            <Space direction="vertical" gap={12} className="w-screen p-3 overflow-y-scroll">
                <Card round>
                    <Card.Body>
                        <div className="flex flex-row">
                            <div>
                                <div>累计日记</div>
                                <div>983</div>
                            </div>
                            <div>
                                <div>累计字数</div>
                                <div>155351</div>
                            </div>
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
                <ActionBar.Button color={buttonColor} text="保存" onClick={onClickWrite} />
            </ActionBar>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
    const config = await getDiaryConfig()

    if (!config) return {
        redirect: { statusCode: 302, destination: '/error/NO_CONFIG' }
    }

    const { writeDiaryButtonColors } = config
    const randIndex = Math.floor(Math.random() * (writeDiaryButtonColors?.length))

    return {
        props: { buttonColor: writeDiaryButtonColors[randIndex] }
    }
}

export default DiaryList