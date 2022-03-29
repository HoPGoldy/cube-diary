import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ConfigProvider } from 'react-vant'
import Head from 'next/head'

const themeVars = {
    passwordInputBackgroundColor: '#f7f8fa'
}

function MyApp({ Component, pageProps }: AppProps) {
    console.log('pageProps', pageProps)
    return (
        <ConfigProvider themeVars={themeVars}>
            <Head>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Component {...pageProps} />
        </ConfigProvider>
    )
}

export default MyApp
