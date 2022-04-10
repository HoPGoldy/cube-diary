import Link from 'components/Link'
import { FC, MouseEventHandler } from 'react'
import { Card, Loading } from 'react-vant'
import { LoadingMask } from './PageLoading'

/**
 * 页面正文，会给下面的操作栏留出空间
 */
export const PageContent: FC = (props) => {
    return (
        <div className="w-full overflow-y-scroll" style={{ height: 'calc(100vh - 72px)'}}>
            {props.children}
        </div>
    )
}

/**
 * 底部操作栏
 * 为何不用 react-vant 的 ActionBar 呢，因为ActionBar 样式改起来比较麻烦
 * 而且 fixed 的布局在一些手机浏览器上滚动时会出现抖动的问题
 */
export const PageAction: FC = (props) => {
    return (
        <div className="p-2 flex flex-row" style={{ height: '72px'}}>
            {props.children}
        </div>
    )
}

interface ActionIconProps {
    href?: string
    onClick?: () => unknown
}

/**
 * 底部操作栏中的图标
 */
export const ActionIcon: FC<ActionIconProps> = (props) => {
    const el = (
        <Card className="m-2 p-2 flex items-center" round onClick={props.onClick}>
            {props.children}
        </Card>
    )

    if (!props.href) return el

    return (
        <Link href={props.href}>{el}</Link>
    )
}

type ActionButtonProps = {
    color?: string,
    loading?: boolean
    onClick?: MouseEventHandler<HTMLDivElement>
}

/**
 * 底部操作栏中的按钮
 */
export const ActionButton: FC<ActionButtonProps> = (props) => {
    const styles = { background: props.color || 'f000' }

    return (
        <div
            className="m-2 p-2 flex items-center justify-center grow rounded-lg text-white relative"
            style={styles}
            onClick={props.loading ? undefined : props.onClick}
        >
            {props.loading ? <Loading color="#fff" /> : props.children}
        </div>
    )
}