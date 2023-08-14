import React, { FC } from 'react';
import { Button, Card, ConfigProvider, Drawer, DrawerProps, ThemeConfig } from 'antd';
import { MobileArea } from '../layouts/responsive';
import { PageAction, PageContent } from '../layouts/pageWithAction';

const themeConfig: ThemeConfig = {
  token: {
    fontSize: 16,
    lineHeight: 1.6,
  },
};

/**
 * 移动端专用的底部弹窗
 * @param props Antd Drawer 的属性
 */
export const MobileDrawer: FC<DrawerProps> = (props) => {
  return (
    <MobileArea>
      <ConfigProvider theme={themeConfig}>
        <Drawer
          placement='bottom'
          footer={
            props.footer || (
              <Button block size='large' onClick={props.onClose}>
                关闭
              </Button>
            )
          }
          bodyStyle={{ padding: 8, paddingBottom: 0 }}
          footerStyle={{ padding: 8, border: 'none' }}
          closable={false}
          headerStyle={{ textAlign: 'center', padding: 8 }}
          {...props}>
          {props.children}
        </Drawer>
      </ConfigProvider>
    </MobileArea>
  );
};

interface MobilePageDrawerProps extends DrawerProps {
  title: string | React.ReactNode;
  content: string | React.ReactNode;
  action: React.ReactNode;
}

/**
 * 移动端的页面结构
 * 包含顶部标题和正文区域
 */
export const MobilePageDrawer: FC<MobilePageDrawerProps> = (props) => {
  const { title, ...restProps } = props;
  return (
    <Drawer
      closable={false}
      bodyStyle={{ padding: 0 }}
      placement='left'
      width='100%'
      {...restProps}>
      <PageContent>
        <div className='m-4'>
          <Card size='small' className='text-center text-base font-bold mb-4'>
            {title}
          </Card>
          {props.content}
        </div>
      </PageContent>

      <PageAction>{props.action}</PageAction>
    </Drawer>
  );
};
