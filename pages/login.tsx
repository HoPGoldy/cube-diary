import type { NextPage } from 'next'
import { PasswordInput, Notify } from 'react-vant'
import { login } from 'services/user'
import { USER_TOKEN_KEY } from 'lib/auth'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useContext } from 'react'
import { UserConfigContext } from './_app'


const Home: NextPage = () => {
    const router = useRouter()
    const { passwordLength = 6, appTitle, appSubtitle = '' } = useContext(UserConfigContext) || {}

    const onSubmit = async (password: string) => {
        // console.log('password', password, md5(password).toString().toUpperCase())
        const resp = await login(password)
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
                className="w-5/6 sm:w-1/2 md:w-1/4"
                gutter={10}
                info="请输入密码"
                length={passwordLength}
                onSubmit={onSubmit}
            />
        </div>
    )
}

export default Home