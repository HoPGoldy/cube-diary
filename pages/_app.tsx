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
    passwordInputBackgroundColor: '#f7f8fa',
    diaryMainColor: '#000'
}

const darkTheme = {
    backgroundColor: 'var(--rv-diary-background-color)',
    cardColor: 'var(--rv-diary-main-color)',
    cardHeaderColor: 'var(--rv-diary-main-color)',
    cardBackgroundColor: 'var(--rv-diary-card-background-color)',
    cellTextColor: 'var(--rv-diary-main-color)',
    cellBackgroundColor: 'var(--rv-diary-card-background-color)',
    fieldInputTextColor: "var(--rv-diary-main-color)",
    // pickerBackgroundColor: "#1e293b",
    pickerBackgroundColor: "var(--rv-black)",
    diaryMainColor: '#9CA3AF',
    diaryCardBackgroundColor: '#1E293B',
    diaryBackgroundColor: '#0F172A'
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
