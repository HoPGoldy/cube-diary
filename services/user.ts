import { LoginResData, UserInfo } from "@pages/api/user"
import md5 from "crypto-js/md5"
import { USER_TOKEN_KEY } from "lib/auth"
import { get, post } from "lib/request"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { FontendConfig } from "types/global"

/**
 * 用户登陆
 * @param password 用户输入的密码明文
 */
export const login = async function (password: string) {
    return await post<LoginResData>('/api/user', {
        code: md5(password).toString().toUpperCase()
    })
}

/**
 * 获取用户信息及自定义设置
 */
export const useUserInfo = function () {
    const router = useRouter()
    const [userInfo, setUserInfo] = useState<UserInfo>()

    useEffect(() => {
        const userToken = localStorage.getItem(USER_TOKEN_KEY)
        if (!userToken) {
            router.replace('/login')
            return
        }

        const fetchUserInfo = async function () {
            const resp = await get<UserInfo>(`/api/user`)
            if (!resp.success) {
                router.replace('/login')
                return
            }

            setUserInfo(resp.data)
        }

        fetchUserInfo()
    }, [])

    return { userInfo, setUserInfo }
}

/**
 * 获取全局应用配置
 */
export const useAppConfig = function () {
    const router = useRouter()
    const [appConfig, setAppConfig] = useState<FontendConfig>()

    useEffect(() => {
        const fetchUserConfig = async function () {
            const resp = await get<FontendConfig>(`/api/appConfig`)
            if (!resp.success) {
                router.push('/error/NO_CONFIG')
                return
            }

            setAppConfig(resp.data)
        }

        fetchUserConfig()
    }, [])

    return appConfig
}
