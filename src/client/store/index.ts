import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import type { TypedUseSelectorHook } from 'react-redux'
import userReducer from './user'
import globalReducer from './global'
import menuReducer from './menu'

export const store = configureStore({
    reducer: {
        user: userReducer,
        global: globalReducer,
        menu: menuReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// 为 useDispatch 添加类型
export const useAppDispatch: () => AppDispatch = useDispatch

// 为 useSelector 添加类型
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
