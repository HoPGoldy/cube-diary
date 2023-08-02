import { AppTheme, FrontendUserInfo, LoginSuccessResp } from '@/types/user'
import Cookies from 'js-cookie'
import { atom, getDefaultStore } from 'jotai'

/**
 * 从用户信息中获取主题色
 * 在用户信息没有获取到时，从 localStorage 和默认值获取
 */
export const getUserTheme = (userInfo?: FrontendUserInfo): AppTheme => {
    return userInfo?.theme
        || localStorage.getItem('cube-diary-theme') as AppTheme
        || AppTheme.Light
}

/**
 * 当前登录用户状态
 */
export const stateUser = atom<FrontendUserInfo | undefined>(undefined)

/**
 * 当前用户的防重放攻击密钥
 * 登录后设置
 */
export const stateReplayAttackSecret = atom<string | undefined>(undefined)

/**
 * 当前用户的登录 token
 */
export const stateUserToken = atom<string | undefined>(undefined)

export const logout = () => {
    const store = getDefaultStore()

    store.set(stateUser, undefined)
    store.set(stateReplayAttackSecret, undefined)
    store.set(stateUserToken, undefined)
    localStorage.removeItem('cube-diary-token')
    Cookies.remove('cube-diary-token')
}

export const login = (payload: LoginSuccessResp) => {
    const { token, replayAttackSecret, ...userInfo } = payload
    const store = getDefaultStore()

    store.set(stateUser, userInfo)
    store.set(stateReplayAttackSecret, replayAttackSecret)
    store.set(stateUserToken, token)
    localStorage.setItem('cube-diary-token', token)
    Cookies.set('cube-diary-token', token)
}

export const changeTheme = (theme: AppTheme) => {
    const store = getDefaultStore()
    const userInfo = store.get(stateUser)

    if (!userInfo) return
    store.set(stateUser, { ...userInfo, theme })
    localStorage.setItem('cube-diary-theme', theme)
}