import React, { FC, useEffect, PropsWithChildren } from 'react'
import { useAppDispatch, useAppSelector } from '../store'
import debounce from 'lodash/debounce'
import { getIsMobile, setIsMobile } from '../store/global'

export const ResponsiveProvider: FC<PropsWithChildren> = ({ children }) => {
    const dispatch = useAppDispatch()

    useEffect(() => {
        const listener = debounce(() => {
            dispatch(setIsMobile(getIsMobile()))
        }, 300)

        window.addEventListener('resize', listener, true)
        return () => {
            window.removeEventListener('resize', listener, true)
        }
    }, [])
    
    return (<>{children}</>)
}

export const useIsMobile = () => {
    return useAppSelector(s => s.global.isMobile)
}

export const MobileArea: FC<PropsWithChildren> = ({ children }) => {
    const isMobile = useIsMobile()
    if (!isMobile) return null
    return (<>{children}</>)
}

export const DesktopArea: FC<PropsWithChildren> = ({ children }) => {
    const isMobile = useIsMobile()
    if (isMobile) return null
    return (<>{children}</>)
}