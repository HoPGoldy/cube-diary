import type { NextPage } from 'next'
import { PasswordInput, Notify } from 'react-vant'
import { login } from 'services/user'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useContext, useState, useRef } from 'react'
import { UserConfigContext, UserProfileContext } from './_app'
import { PasswordInputInstance } from 'react-vant/es/password-input/PropsType'
import { USER_TOKEN_KEY } from 'lib/constants'

const Home: NextPage = () => {
    const router = useRouter()
    const { passwordLength = 6, appTitle, appSubtitle = '' } = useContext(UserConfigContext) || {}
    const { setUserProfile } = useContext(UserProfileContext) || {}
    const [password, setPassword] = useState('')
    const passwordRef = useRef<PasswordInputInstance>(null)

    const onSubmit = async (password: string) => {
        const resp = await login(password)
        if (!resp.success) {
            Notify.show({ type: 'warning', message: resp.message })
            setPassword('')
            passwordRef.current?.focus()
            return
        }

        if (!resp?.data?.token) {
            Notify.show({ type: 'danger', message: '找不到 token！' })
            return
        }

        localStorage.setItem(USER_TOKEN_KEY, resp?.data?.token)
        setUserProfile && setUserProfile(resp?.data)
        Notify.show({ type: 'success', message: `欢迎回来 ${resp.data.username}` })
        router.push('/')
    }

    const onPasswordChange = (password: string) => {
        // 这里不能直接绑定到 PasswordInput 的 onSubmit 上，不然会导致触发两次 onSubmit
        if (password.length === passwordLength) onSubmit(password)
        setPassword(password)
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
                ref={passwordRef}
                className="w-5/6 sm:w-1/2 md:w-1/4"
                gutter={10}
                info="请输入密码"
                length={passwordLength}
                value={password}
                onChange={onPasswordChange}
            />
        </div>
    )
}

export default Home