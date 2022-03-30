import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ConfigProvider, Loading } from 'react-vant'
import Head from 'next/head'
import { useAppConfig, useUserInfo } from 'services/user'
import { createContext, Dispatch, SetStateAction } from 'react'
import { FontendConfig } from 'types/global'
import { PageLoading } from 'components/PageLoading'
import { UserInfo } from './api/user'

const themeVars = {
    passwordInputBackgroundColor: '#f7f8fa'
}

export const UserConfigContext = createContext<FontendConfig | undefined>(undefined)

interface IUserInfoContext {
    userInfo: UserInfo | undefined
    setUserInfo: Dispatch<SetStateAction<UserInfo | undefined>>;
}

export const UserInfoContext = createContext<IUserInfoContext | undefined>(undefined)

function MyApp({ Component, pageProps }: AppProps) {
    const config = useAppConfig()
    const userInfo = useUserInfo()

    return (
        <ConfigProvider themeVars={themeVars}>
            <Head>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <UserInfoContext.Provider value={userInfo}>
                <UserConfigContext.Provider value={config}>
                    {config ? <Component {...pageProps} /> : <PageLoading />}
                </UserConfigContext.Provider>
            </UserInfoContext.Provider>
        </ConfigProvider>
    )
}

export default MyApp
