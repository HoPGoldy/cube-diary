import { useContext, useEffect } from 'react'
import { NextPage } from 'next'
import Head from 'next/head'
import { Card, Switch, Form, Space, ActionBar, Cell, Notify, Button } from 'react-vant'
import { useRouter } from 'next/router'
import { Statistic } from 'components/Statistic'
import { UserConfigContext, UserProfileContext } from './_app'
import { ManagerO, ArrowLeft } from '@react-vant/icons'
import { USER_TOKEN_KEY } from 'lib/constants'
import { useUserProfile } from 'services/user'

const DiaryList: NextPage = () => {
    const router = useRouter()
    const { buttonColor } = useContext(UserConfigContext) || {}
    // 当前缓存的用户配置
    const { userProfile, setUserProfile } = useContext(UserProfileContext) || {}
    // 进入页面后重新加载
    const { userProfile: newUserProfile } = useUserProfile()

    useEffect(() => {
        if (!newUserProfile || !setUserProfile) return
        setUserProfile(newUserProfile)
    }, [newUserProfile])

    const [form] = Form.useForm();

    const onFinish = () => {

    };

    const onSaveSetting = () => {
        router.back()
        Notify.show({ type: 'success', message: '设置已保存' })
    }

    const onLogout = () => {
        localStorage.removeItem(USER_TOKEN_KEY)
        router.replace('/login')
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
                            <Statistic label="累计日记" value={userProfile?.totalDiary || 0} />
                            <Statistic label="累计字数" value={userProfile?.totalCount || 0} />
                        </div>
                    </Card.Body>
                </Card>

                <Card round>
                    <Cell title="当前登陆" icon={<ManagerO />} value={userProfile?.username} />
                </Card>

                <Card round>
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
                </Card>

                <Card round onClick={onLogout}>
                    <Cell title="登出" isLink />
                </Card>
            </Space>

            <ActionBar>
                <ActionBar.Icon icon={<ArrowLeft />} text="返回" onClick={() => router.back()} />
                <ActionBar.Button color={buttonColor} text="保存" onClick={onSaveSetting} />
            </ActionBar>
        </div>
    )
}

export default DiaryList