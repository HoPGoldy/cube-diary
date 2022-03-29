import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ConfigProvider, Loading } from 'react-vant'
import Head from 'next/head'
import { useUserConfig } from 'services/user'
import { createContext } from 'react'
import { FontendConfig } from 'types/global'
import { PageLoading } from 'components/PageLoading'

const themeVars = {
    passwordInputBackgroundColor: '#f7f8fa'
}

export const UserConfigContext = createContext<FontendConfig | undefined>(undefined)

function MyApp({ Component, pageProps }: AppProps) {
    const config = useUserConfig()

    return (
        <ConfigProvider themeVars={themeVars}>
            <Head>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <UserConfigContext.Provider value={config}>
                {config ? <Component {...pageProps} /> : <PageLoading />}
            </UserConfigContext.Provider>
        </ConfigProvider>
    )
}

export default MyApp
