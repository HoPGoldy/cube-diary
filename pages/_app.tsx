import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ConfigProvider } from 'react-vant'
import Head from 'next/head'
import { useAppConfig, useUserProfile } from 'services/user'
import { createContext, Dispatch, SetStateAction } from 'react'
import { FontendConfig } from 'types/global'
import { PageLoading } from 'components/PageLoading'
import { UserProfile } from 'types/storage'
// import Script from 'next/script'

const lightTheme = {
    passwordInputBackgroundColor: '#f7f8fa'
}

const darkTheme = {
    backgroundColor: '#0f172a',
    cardColor: '#9CA3AF',
    cardBackgroundColor: '#1e293b',
    cellTextColor: '#9CA3AF',
    cellBackgroundColor: '#1e293b'
}

export const UserConfigContext = createContext<FontendConfig | false | undefined>(undefined)

interface IUserProfileContext {
    userProfile: UserProfile | undefined
    setUserProfile: Dispatch<SetStateAction<UserProfile | undefined>>;
}

export const UserProfileContext = createContext<IUserProfileContext | undefined>(undefined)

function MyApp({ Component, pageProps }: AppProps) {
    const config = useAppConfig()
    const userInfo = useUserProfile()

    return (
        <ConfigProvider themeVars={userInfo.userProfile?.darkTheme ? darkTheme : lightTheme}>
            {/* <Script src="https://cdn.bootcss.com/vConsole/3.2.0/vconsole.min.js" strategy="lazyOnload" onLoad={() => {
                new VConsole()
            }} /> */}
            <Head>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <UserProfileContext.Provider value={userInfo}>
                <UserConfigContext.Provider value={config}>
                    <div style={{ backgroundColor: 'var(--rv-background-color)'}}>
                        {config !== undefined ? <Component {...pageProps} /> : <PageLoading />}
                    </div>
                </UserConfigContext.Provider>
            </UserProfileContext.Provider>
        </ConfigProvider>
    )
}

export default MyApp
