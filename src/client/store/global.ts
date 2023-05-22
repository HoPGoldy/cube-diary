import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { AppConfigResp } from '@/types/appConfig'

interface UserState {
    appConfig?: AppConfigResp
    /**
     * 日记列表里要聚焦的日记
     * 这个值如果被设置的话，日记列表就会滚动到对应的日记
     */
    focusDiaryDate?: string
    /**
     * 当前是否为移动端
     * 会根据这个属性来决定是否渲染对应平台的组件
     */
    isMobile: boolean
}

export const getIsMobile = () => {
    const screenWidth = window.innerWidth
        || document.documentElement.clientWidth
        || document.body.clientWidth

    return screenWidth < 768
}

const initialState: UserState = {
    isMobile: getIsMobile(),
}

export const globalSlice = createSlice({
    name: 'global',
    initialState,
    reducers: {
        setAppConfig: (state, action: PayloadAction<AppConfigResp>) => {
            state.appConfig = action.payload
        },
        setFocusDiaryDate: (state, action: PayloadAction<string | undefined>) => {
            state.focusDiaryDate = action.payload
        },
        initSuccess: (state) => {
            state.appConfig?.needInit && (state.appConfig.needInit = false)
        },
        setIsMobile: (state, action: PayloadAction<boolean>) => {
            if (state.isMobile === action.payload) return
            state.isMobile = action.payload
        }
    },
})

export const { setAppConfig, initSuccess, setIsMobile, setFocusDiaryDate } = globalSlice.actions

export default globalSlice.reducer
