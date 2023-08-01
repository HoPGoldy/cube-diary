import { useMemo } from 'react'
import { MyJwtPayload } from '@/types/global'
import { useAppSelector } from '../store'
import { useAtomValue } from 'jotai'
import { stateUserToken } from '../store/user'

/**
 * 获取 jwt payload 明文
 */
export const useJwtPayload = () => {
    const token = useAtomValue(stateUserToken)
    const payload = useMemo<MyJwtPayload>(() => {
        if (!token) return undefined
        return JSON.parse(decodeURIComponent(escape(window.atob(token.split('.')[1]))))
    }, [token])

    return payload
}