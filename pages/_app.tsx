import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ConfigProvider } from 'react-vant'

const themeVars = {
    passwordInputBackgroundColor: '#f7f8fa'
};

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <ConfigProvider themeVars={themeVars}>
            <Component {...pageProps} />
        </ConfigProvider>
    )
}

export default MyApp
