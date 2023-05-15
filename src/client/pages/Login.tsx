import { STATUS_CODE } from '@/config'
import { LoginSuccessResp } from '@/types/user'
import { sha } from '@/utils/crypto'
import { Button, Input, InputRef } from 'antd'
import React, { useRef, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useLogin } from '../services/user'
import { useAppDispatch, useAppSelector } from '../store'
import { setCurrentArticle } from '../store/menu'
import { login } from '../store/user'
import { messageError, messageSuccess } from '../utils/message'
import { UserOutlined, KeyOutlined } from '@ant-design/icons'
import { PageTitle } from '../components/PageTitle'

const Register = () => {
    const dispatch = useAppDispatch()
    // 用户名
    const [username, setUsername] = useState('')
    // 密码
    const [password, setPassword] = useState('')
    // 用户名输入框
    const usernameInputRef = useRef<InputRef>(null)
    // 密码输入框
    const passwordInputRef = useRef<InputRef>(null)
    // 应用配置
    const config = useAppSelector(s => s.global.appConfig)
    // 提交登录
    const { mutateAsync: postLogin, isLoading: isLogin } = useLogin()
    // store 里的用户信息
    const userInfo = useAppSelector(s => s.user.userInfo)

    const onSubmit = async () => {
        if (!username) {
            messageError('请输入用户名')
            usernameInputRef.current?.focus()
            return
        }

        if (!password) {
            messageError('请输入密码')
            passwordInputRef.current?.focus()
            return
        }

        const resp = await postLogin({ username, password: sha(password) })
        if (resp.code !== STATUS_CODE.SUCCESS) return

        messageSuccess(`登录成功，欢迎回来，${resp?.data?.username}`)
        const userInfo = resp.data as LoginSuccessResp
        dispatch(login(userInfo))
        dispatch(setCurrentArticle(userInfo.rootArticleId))
    }

    if (userInfo) {
        return <Navigate to="/" replace />
    }

    return (
        <div className="h-screen w-screen bg-gray-100 flex flex-col justify-center items-center dark:text-gray-100">
            <PageTitle title='登录' />
            <header className="w-screen text-center min-h-[236px]">
                <div className="text-5xl font-bold text-mainColor">{config?.appName}</div>
                <div className="mt-4 text-xl text-mainColor">{config?.loginSubtitle}</div>
            </header>
            <div className='w-[70%] md:w-[40%] lg:w-[30%] xl:w-[20%] flex flex-col items-center'>
                <Input
                    size='large'
                    className='mb-2'
                    ref={usernameInputRef}
                    placeholder="请输入用户名"
                    prefix={<UserOutlined />}
                    autoFocus
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    onKeyUp={e => {
                        if (e.key === 'Enter') {
                            passwordInputRef.current?.focus()
                        }
                    }}
                />

                <Input.Password
                    size='large'
                    className='mb-2'
                    ref={passwordInputRef}
                    placeholder="请输入密码"
                    prefix={<KeyOutlined />}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyUp={e => {
                        if (e.key === 'Enter') onSubmit()
                    }}
                />

                <Button
                    size='large'
                    block
                    disabled={isLogin}
                    type="primary"
                    style={{ background: config?.buttonColor }}
                    onClick={onSubmit}
                >登 录</Button>
            </div>
        </div>
    )
}

export default Register