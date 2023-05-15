import { STATUS_CODE } from '@/config'
import { sha } from '@/utils/crypto'
import { Button, Input, InputRef } from 'antd'
import React, { useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useRegister } from '../services/user'
import { useAppSelector } from '../store'
import { messageError, messageSuccess } from '../utils/message'
import { UserOutlined, KeyOutlined } from '@ant-design/icons'
import { PageTitle } from '../components/PageTitle'

const Register = () => {
    const navigate = useNavigate()
    const { inviteCode } = useParams()
    // 用户名
    const [username, setUsername] = useState('')
    // 密码
    const [password, setPassword] = useState('')
    // 密码确认
    const [passwordConfirm, setPasswordConfirm] = useState('')
    // 输入框引用（用户名，密码输入框，密码确认框）
    const inputRef = useRef<(InputRef | null)[]>([])
    // 应用配置
    const config = useAppSelector(s => s.global.appConfig)
    // 提交登录
    const { mutateAsync: postRegistration, isLoading: isRegistering } = useRegister()
    // store 里的用户信息
    const userInfo = useAppSelector(s => s.user.userInfo)

    const onSubmit = async () => {
        if (!username) {
            messageError('请输入用户名')
            inputRef.current?.[0]?.focus()
            return
        }

        if (!password) {
            messageError('请输入密码')
            inputRef.current?.[1]?.focus()
            return
        }
        
        if (!password) {
            messageError('请重复密码')
            inputRef.current?.[2]?.focus()
            return
        }

        if (password !== passwordConfirm) {
            messageError('两次密码不一致')
            inputRef.current?.[2]?.focus()
            return
        }

        if (password.length < 6) {
            messageError('密码长度至少六位')
            inputRef.current?.[1]?.focus()
            return
        }

        if (!inviteCode) {
            messageError('邀请码错误')
            return
        }

        const resp = await postRegistration({ username, passwordHash: sha(password), inviteCode })
        if (resp.code !== STATUS_CODE.SUCCESS) return

        messageSuccess(`注册成功，欢迎使用 ${username}`)
        navigate('/login', { replace: true })
    }

    if (userInfo) {
        return <Navigate to="/" replace />
    }

    return (
        <div className="h-screen w-screen bg-gray-100 flex flex-col justify-center items-center dark:text-gray-100">
            <PageTitle title='注册' />
            <header className="w-screen text-center min-h-[236px]">
                <div className="text-5xl font-bold text-mainColor">{config?.appName}</div>
                <div className="mt-4 text-xl text-mainColor">用户注册</div>
                <div className="mt-4 text-base text-mainColor">密码至少六位，请妥善保管密码</div>
            </header>
            <div className='w-[70%] md:w-[40%] lg:w-[30%] xl:w-[20%] flex flex-col items-center'>
                <Input
                    size='large'
                    className='mb-2'
                    ref={ref => inputRef.current[0] = ref}
                    placeholder="请输入用户名"
                    prefix={<UserOutlined />}
                    autoFocus
                    value={username}
                    disabled={isRegistering}
                    onChange={e => setUsername(e.target.value)}
                    onKeyUp={e => {
                        if (e.key === 'Enter') {
                            inputRef.current[1]?.focus()
                        }
                    }}
                />

                <Input.Password
                    size='large'
                    className='mb-2'
                    ref={ref => inputRef.current[1] = ref}
                    placeholder="请输入密码"
                    prefix={<KeyOutlined />}
                    value={password}
                    disabled={isRegistering}
                    onChange={e => setPassword(e.target.value)}
                    onKeyUp={e => {
                        if (e.key === 'Enter') {
                            inputRef.current[2]?.focus()
                        }
                    }}
                />

                <Input.Password
                    size='large'
                    className='mb-2'
                    ref={ref => inputRef.current[2] = ref}
                    placeholder="请重复密码"
                    prefix={<KeyOutlined />}
                    value={passwordConfirm}
                    disabled={isRegistering}
                    onChange={e => setPasswordConfirm(e.target.value)}
                    onKeyUp={e => {
                        if (e.key === 'Enter') onSubmit()
                    }}
                />

                <Button
                    size='large'
                    block
                    disabled={isRegistering}
                    type="primary"
                    style={{ background: config?.buttonColor }}
                    onClick={onSubmit}
                >注册</Button>
            </div>
        </div>
    )
}

export default Register