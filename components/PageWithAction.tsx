import { Search } from '@react-vant/icons'
import Link from 'components/Link'
import { DebouncedFunc } from 'lodash'
import debounce from 'lodash/debounce'
import { FC, MouseEventHandler, useContext, useEffect, useRef, useState } from 'react'
import { Card, Field, FieldInstance, Loading } from 'react-vant'
import { UserConfigContext } from './ContextContainer'

/**
 * 页面正文，会给下面的操作栏留出空间
 */
export const PageContent: FC = (props) => {
    return (
        <div className="w-full overflow-y-scroll relative" style={{ height: 'calc(100vh - 72px)'}}>
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
    const { buttonColor } = useContext(UserConfigContext) || {}
    const styles = { background: props.color || buttonColor || 'f000' }

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

type ActionSearchProps = {
    /**
     * 搜索的节流事件，单位毫秒
     */
    debounceWait?: number
    /**
     * 是否自动聚焦输入框
     */
    autoFocus?: boolean
    /**
     * 触发搜索事件，会受到 debounceWait 的影响
     */
    onSearch?: (value: string) => unknown
}

/**
 * 操作栏中的搜索按钮
 */
export const ActionSearch: FC<ActionSearchProps> = (props) => {
    const { onSearch, debounceWait = 500, autoFocus } = props

    // 搜索内容
    const [searchValue, setSearchValue] = useState('')

    // 搜索防抖实例
    const searchDebounce = useRef<DebouncedFunc<(newValue: string) => void>>()
    useEffect(() => {
        searchDebounce.current = debounce((newValue: string) => {
            onSearch?.(newValue)
        }, debounceWait)
    }, [])

    // 回调 - 搜索内容变化
    const onSearchValueChange = (value: string) => {
        setSearchValue(value)
        searchDebounce.current?.(value)
    }

    // 自动聚焦实现，组件的 autoFocus 不好用
    const fieldRef = useRef<FieldInstance>(null)
    useEffect(() => {
        autoFocus && fieldRef.current?.focus()
    }, []);

    return (
        <div className="m-2 flex items-center justify-center grow rounded-lg text-white relative">
            <Field
                ref={fieldRef}
                style={{ height: '40px' }}
                value={searchValue}
                onChange={onSearchValueChange}
                rightIcon={<Search />}
                placeholder="搜索内容"
                onClickRightIcon={() => onSearch?.(searchValue)}
            />
        </div>
    )
}
