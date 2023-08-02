import { AppConfigResp } from '@/types/appConfig'
import { atom } from 'jotai'

export const getIsMobile = () => {
    const screenWidth = window.innerWidth
        || document.documentElement.clientWidth
        || document.body.clientWidth

    return screenWidth < 768
}

/**
 * 当前应用配置
 */
export const stateAppConfig = atom<AppConfigResp | undefined>(undefined)

/**
 * 日记列表里要聚焦的日记
 * 这个值如果被设置的话，日记列表就会滚动到对应的日记
 */
export const stateFocusDiaryDate = atom<string | undefined>(undefined)

/**
 * 当前是否为移动端
 * 会根据这个属性来决定是否渲染对应平台的组件
 */
export const stateIsMobile = atom<boolean>(getIsMobile())

