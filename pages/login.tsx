import type { GetServerSideProps, NextPage } from 'next'
import { PasswordInput, Notify } from 'react-vant'
import { getDiaryConfig } from 'lib/loadConfig'
import { login } from 'services/user'
import { USER_TOKEN_KEY } from 'lib/auth'
import { useRouter } from 'next/router'
import Head from 'next/head'

interface Props {
    passwordLength: number
    appTitle: string
    appSubtitle?: string
}

const Home: NextPage<Props> = (props) => {
    const { passwordLength, appTitle, appSubtitle = '' } = props
    const router = useRouter()

    const onSubmit = async (password: string) => {
        // console.log('password', password, md5(password).toString().toUpperCase())
        const resp = await login(password)
        console.log('resp', resp)
        if (!resp.success) {
            Notify.show({ type: 'warning', message: resp.message })
            return
        }

        if (!resp?.data?.token) {
            Notify.show({ type: 'danger', message: '找不到 token！' })
            return
        }

        localStorage.setItem(USER_TOKEN_KEY, resp?.data?.token)
        Notify.show({ type: 'success', message: `欢迎回来 ${resp.data.username}` })
        router.push('/')
    }

    return (
        <div className="h-screen w-screen bg-white flex flex-col justify-center items-center">
            <Head>
                <title>日记登陆</title>
            </Head>
            <header className="w-screen text-center mb-36 ">
                <div className="text-5xl font-bold">{appTitle}</div>
                {appSubtitle && <div className="mt-4 text-xl text-gray-600">{appSubtitle}</div>}
            </header>
            <PasswordInput
                className="w-5/6 sm:w-1/2"
                gutter={10}
                info="请输入密码"
                length={passwordLength}
                onSubmit={onSubmit}
            />
        </div>
    )
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
    const config = await getDiaryConfig()

    if (!config) return {
        redirect: { statusCode: 302, destination: '/error/NO_CONFIG' }
    }

    const { passwordLength, appTitle, appSubtitle  } = config
    return { props: { passwordLength, appTitle, appSubtitle } }
}

export default Home