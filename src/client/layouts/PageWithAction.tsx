import React, { FC, PropsWithChildren } from 'react'
import { Button, ButtonProps, Input } from 'antd'
import { MobileArea } from './Responsive'
import { SearchOutlined } from '@ant-design/icons'
import { SearchProps } from 'antd/es/input'

/**
 * 页面正文，会给下面的操作栏留出空间
 */
export const PageContent: FC<PropsWithChildren> = (props) => {
    return (
        <div className="overflow-y-auto relative md:h-full h-page-content" >
            {props.children}
        </div>
    )
}

/**
 * 底部操作栏
 */
export const PageAction: FC<PropsWithChildren> = (props) => {
    return (
        <MobileArea>
            <div className="p-2 flex flex-row md:hidden h-bottombar">
                {props.children}
            </div>
        </MobileArea>
    )
}

/**
 * 底部操作栏中的图标
 */
export const ActionIcon: FC<ButtonProps> = (props) => {
    const { className, ...restProps } = props
    return (
        <Button
            size="large"
            className={'mr-2 flex-shrink-0 ' + className}
            {...restProps}
        />
    )
}

/**
 * 底部操作栏中的按钮
 */
export const ActionButton: FC<ButtonProps> = (props) => {
    return (
        <Button
            type="primary"
            block
            size="large"
            {...props}
        >
            {props.children}
        </Button>
    )
}

/**
 * 操作栏中的搜索按钮
 */
export const ActionSearch: FC<SearchProps> = (props) => {
    return (
        <Input.Search
            placeholder="输入关键字搜索"
            enterButton={<SearchOutlined />}
            size="large"
            autoFocus
            {...props}
        />
    )
}
