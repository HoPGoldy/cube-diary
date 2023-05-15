import React, { FC, useEffect, PropsWithChildren } from 'react'
import { useQueryAppConfig } from '../services/global'
import { useAppDispatch, useAppSelector } from '../store'
import { setAppConfig } from '../store/global'
import { Navigate, useLocation } from 'react-router-dom'
import Loading from './Loading'

export const AppConfigProvider: FC<PropsWithChildren> = (props) => {
    const location = useLocation()
    const appConfig = useAppSelector(s => s.global.appConfig)
    const dispatch = useAppDispatch()

    const { data, isError } = useQueryAppConfig()

    useEffect(() => {
        if (!data || !data.data) return
        dispatch(setAppConfig(data.data))
    }, [data])

    if (appConfig?.needInit && location.pathname !== '/init') {
        return <Navigate to="/init" replace />
    }

    return (
        <>{
            !appConfig 
                ? <Loading tip={isError ? '加载失败，请刷新重试' : '正在加载应用配置...'} className="pt-24" />
                : props.children
        }</>
    )
}