import { useContext, useEffect } from 'react'
import { NextPage } from 'next'
import Head from 'next/head'
import { Card, Space, Cell, Switch } from 'react-vant'
import { useRouter } from 'next/router'
import { Statistic } from 'components/Statistic'
import { ArrowDown, ArrowUp, ManagerO, Close, DesktopO, LikeO, StarO } from '@react-vant/icons'
import { USER_TOKEN_KEY } from 'lib/constants'
import { updateUserProfile, useUserProfile } from 'services/user'
import { PageContent, PageAction, ActionButton } from 'components/PageWithAction'
import { refreshCount } from 'services/setting'
import { destroyCookie } from 'nookies'
import { UserProfileContext } from 'components/ContextContainer'

const Setting: NextPage = () => {
    const router = useRouter()
    // 当前缓存的用户配置
    const { userProfile, setUserProfile } = useContext(UserProfileContext) || {}
    // 进入页面后重新加载
    const { userProfile: newUserProfile } = useUserProfile()

    useEffect(() => {
        if (!newUserProfile || !setUserProfile) return
        setUserProfile(newUserProfile)
    }, [newUserProfile])

    const onLogout = () => {
        destroyCookie(null, USER_TOKEN_KEY)
        router.replace('/login')
    }

    /**
     * 刷新字数统计
     */
    const onRefreshCount = async () => {
        if (!userProfile) return

        const resp = await refreshCount()
        setUserProfile?.({ ...userProfile, totalCount: resp.data || 0 })
    }

    const onSwitchDark = (checked: boolean) => {
        if (!userProfile) return

        setUserProfile?.({ ...userProfile, darkTheme: checked })
        updateUserProfile({ darkTheme: checked })
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
                            <div className="flex flex-row justify-around" onClick={onRefreshCount}>
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
                        <Cell title="备份" icon={<DesktopO />} isLink onClick={() => router.push('/backup')} />
                        <Cell title="黑夜模式" icon={<StarO />} 
                            rightIcon={<Switch
                                size={24}
                                defaultChecked={userProfile?.darkTheme}
                                onChange={onSwitchDark}
                            />}
                        />
                        <Cell title="关于" icon={<LikeO />} isLink onClick={() => router.push('/about')} />
                    </Card>

                    <Card round onClick={onLogout}>
                        <Cell title="登出" icon={<Close />} isLink />
                    </Card>
                </Space>
            </PageContent>

            <PageAction>
                <ActionButton onClick={() => router.back()}>返回</ActionButton>
            </PageAction>
        </div>
    )
}

export default Setting