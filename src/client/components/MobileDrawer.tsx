import React, { FC } from 'react'
import { Button, ConfigProvider, Drawer, DrawerProps, ThemeConfig } from 'antd'
import { MobileArea } from '../layouts/Responsive'

const themeConfig: ThemeConfig = {
    token: {
        fontSize: 16,
        lineHeight: 1.6,
    }
}

/**
 * 移动端专用的底部弹窗
 * @param props Antd Drawer 的属性
 */
export const MobileDrawer: FC<DrawerProps> = (props) => {
    return (
        <MobileArea>
            <ConfigProvider theme={themeConfig}>
                <Drawer
                    placement="bottom"
                    footer={props.footer || (
                        <Button block size="large" onClick={props.onClose}>关闭</Button>
                    )}
                    footerStyle={{ padding: 8, border: 'none' }}
                    closable={false}
                    headerStyle={{ textAlign: 'center', padding: 8 }}
                    {...props}
                >
                    {props.children}
                </Drawer>
            </ConfigProvider>
        </MobileArea>
    )
}