import { LoginResData } from "@pages/api/user"
import md5 from "crypto-js/md5"
import { get, post } from "lib/request"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { FontendConfig, RespData } from "types/global"

export const login = async function (password: string) {
    return await post<LoginResData>('/api/user', {
        code: md5(password).toString().toUpperCase()
    })
}

export const useUserConfig = function () {
    const router = useRouter()
    const [userConfig, setUserConfig] = useState<FontendConfig>()

    useEffect(() => {
        const fetchUserConfig = async function () {
            const resp = await get<FontendConfig>(`/api/userConfig`)
            if (!resp.success) {
                router.push('/error/NO_CONFIG')
                return
            }

            setUserConfig(resp.data)
        }

        fetchUserConfig()
    }, [])

    return userConfig
}
