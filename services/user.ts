import { LoginResData } from "@pages/api/user"
import md5 from "crypto-js/md5"
import { USER_TOKEN_KEY } from "lib/constants"
import { get, post } from "lib/request"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { FontendConfig } from "types/global"
import { UserProfile } from "types/storage"

/**
 * 用户登陆
 * @param password 用户输入的密码明文
 */
export const login = async function (password: string) {
    return await post<LoginResData & UserProfile>('/api/user', {
        code: md5(password).toString().toUpperCase()
    })
}

/**
 * 获取用户信息及自定义设置
 */
export const useUserProfile = function () {
    const router = useRouter()
    const [userProfile, setUserProfile] = useState<UserProfile>()

    useEffect(() => {
        const userToken = localStorage.getItem(USER_TOKEN_KEY)
        if (!userToken) {
            router.replace('/login')
            return
        }

        const fetchUserInfo = async function () {
            const resp = await get<UserProfile>(`/api/user`)
            if (!resp.success) {
                router.replace('/login')
                return
            }

            setUserProfile(resp.data)
        }

        fetchUserInfo()
    }, [])

    return { userProfile, setUserProfile }
}

/**
 * 获取全局应用配置
 */
export const useAppConfig = function () {
    const router = useRouter()
    const [appConfig, setAppConfig] = useState<FontendConfig | false>()

    useEffect(() => {
        // 当配置项不存在时会在每次切换页面时重新尝试获取
        if (appConfig) return

        const fetchUserConfig = async function () {
            const resp = await get<FontendConfig>(`/api/appConfig`)
            if (!resp.success) {
                router.push('/error/NO_CONFIG')
                setAppConfig(false)
                return
            }

            setAppConfig(resp.data)
        }

        fetchUserConfig()
    }, [router.pathname])

    return appConfig
}
