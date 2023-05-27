import { useMemo } from 'react'
import { MyJwtPayload } from '@/types/global'
import { useAppSelector } from '../store'

/**
 * 获取 jwt payload 明文
 */
export const useJwtPayload = () => {
    const token = useAppSelector(s => s.user.token)
    const payload = useMemo<MyJwtPayload>(() => {
        if (!token) return undefined
        return JSON.parse(decodeURIComponent(escape(window.atob(token.split('.')[1]))))
    }, [token])

    return payload
}