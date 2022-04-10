import { FC } from 'react'
import { Loading } from 'react-vant'

/**
 * 用于页面的加载状态
 */
export const PageLoading: FC = () => {
    return <Loading className="my-24" color="#3f45ff" size="36px" vertical>加载中...</Loading>
}

/**
 * 用于按钮或组件的加载状态蒙版
 */
export const LoadingMask: FC<{ className?: string }> = (props) => {
    return <Loading style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--rv-picker-loading-icon-color)',
        backgroundColor: 'var(--rv-picker-loading-mask-color)'
    }} className={props.className} />
}