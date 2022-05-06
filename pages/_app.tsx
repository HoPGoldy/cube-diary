import '../styles/globals.css'
import '../styles/tailwind.css'
import { AppProps } from 'next/app'
import Head from 'next/head'
import { ContextContainer } from 'components/ContextContainer'
// import Script from 'next/script'

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <>
            <Head>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            {/* <Script src="https://cdn.bootcss.com/vConsole/3.2.0/vconsole.min.js" strategy="lazyOnload" onLoad={() => {
                new VConsole()
            }} /> */}
            <ContextContainer>
                <Component {...pageProps} />
            </ContextContainer>
        </>
    )
}

export default MyApp
