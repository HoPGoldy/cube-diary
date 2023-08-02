import React, { FC, useEffect, PropsWithChildren } from 'react'
import { useQueryAppConfig } from '../services/global'
import { stateAppConfig } from '../store/global'
import { Navigate, useLocation } from 'react-router-dom'
import Loading from './loading'
import { useAtom } from 'jotai'

export const AppConfigProvider: FC<PropsWithChildren> = (props) => {
    const location = useLocation()
    const [appConfig, setAppConfig] = useAtom(stateAppConfig)

    const { data, isError } = useQueryAppConfig()

    useEffect(() => {
        if (!data || !data.data) return
        setAppConfig(data.data)
    }, [data])

    if (appConfig?.needInit && location.pathname !== '/init') {
        return <Navigate to="/init" replace />
    }

    return (
        <>{
            !appConfig 
                ? <Loading tip={isError ? '加载失败，请刷新重试' : '应用配置加载中...'} className="pt-24" />
                : props.children
        }</>
    )
}