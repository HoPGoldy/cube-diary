import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ConfigProvider } from 'react-vant'
import Head from 'next/head'
import { useAppConfig, useUserProfile } from 'services/user'
import { createContext, Dispatch, SetStateAction, useEffect } from 'react'
import { FontendConfig } from 'types/global'
import { PageLoading } from 'components/PageLoading'
import { UserProfile } from 'types/storage'
// import Script from 'next/script'

const lightTheme = {
    // passwordInputBackgroundColor: '#ffffff',
    // diaryMainColor: '#000'
}

const darkTheme = {
    // 基础配色
    // diaryMainColor: '#9CA3AF',
    // diaryActiveColor: '#3C4A60',
    // diaryCardBackgroundColor: '#1E293B',
    // diaryBackgroundColor: '#0F172A',
    // // 前景色
    // pickerOptionTextColor: "var(--rv-diary-main-color)",
    // cardColor: 'var(--rv-diary-main-color)',
    // cardHeaderColor: 'var(--rv-diary-main-color)',
    // cellTextColor: 'var(--rv-diary-main-color)',
    // fieldInputTextColor: "var(--rv-diary-main-color)",
    // radioLabelColor: 'var(--rv-diary-main-color)',
    // buttonDefaultColor: 'var(--rv-diary-main-color)',
    // // 背景色
    // pickerBackgroundColor: "var(--rv-diary-card-background-color)",
    // backgroundColor: 'var(--rv-diary-background-color)',
    // cardBackgroundColor: 'var(--rv-diary-card-background-color)',
    // cellBackgroundColor: 'var(--rv-diary-card-background-color)',
    // popupBackgroundColor: 'var(--rv-diary-card-background-color)',
    // cellActiveColor: 'var(--rv-diary-active-color)',
    // dialogBackgroundColor: 'var(--rv-diary-active-color)',
    // buttonDefaultBackgroundColor: 'var(--rv-diary-active-color)',
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

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', userInfo.userProfile?.darkTheme ? 'dark' : '')
    }, [userInfo.userProfile?.darkTheme])
    

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
                    {config !== undefined ? <Component {...pageProps} /> : <PageLoading />}
                </UserConfigContext.Provider>
            </UserProfileContext.Provider>
        </ConfigProvider>
    )
}

export default MyApp
