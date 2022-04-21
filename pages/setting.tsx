import { useContext, useEffect } from 'react'
import { NextPage } from 'next'
import Head from 'next/head'
import { Card, Switch, Form, Space, ActionBar, Cell, Notify, Button, Search } from 'react-vant'
import { useRouter } from 'next/router'
import { Statistic } from 'components/Statistic'
import { UserConfigContext, UserProfileContext } from './_app'
import { ArrowDown, ArrowUp, ManagerO, Close } from '@react-vant/icons'
import { USER_TOKEN_KEY } from 'lib/constants'
import { useUserProfile } from 'services/user'
import { PageContent, PageAction, ActionButton } from 'components/PageWithAction'

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

    const onSaveSetting = () => {
        router.back()
        // Notify.show({ type: 'success', message: '设置已保存' })
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

            <PageContent>
                <Space direction="vertical" gap={16} className="w-screen p-4 overflow-y-scroll">
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
                        <Cell title="导入" icon={<ArrowUp />} isLink onClick={() => router.push('/import/json')} />
                        <Cell title="导出" icon={<ArrowDown />} isLink onClick={() => router.push('/export/json')} />
                    </Card>

                    <Card round onClick={onLogout}>
                        <Cell title="登出" icon={<Close />} isLink />
                    </Card>
                </Space>
            </PageContent>

            <PageAction>
                <ActionButton color={buttonColor} onClick={onSaveSetting}>返回</ActionButton>
            </PageAction>
        </div>
    )
}

export default DiaryList