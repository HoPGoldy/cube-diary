import React, { FC, PropsWithChildren } from 'react';
import { Drawer, DrawerProps, Modal, ModalProps } from 'antd';
import { useIsMobile } from '@/client/layouts/responsive';
import { PageTitle } from '../pageTitle';

export interface SettingContainerProps extends PropsWithChildren {
  title: string;
  open: boolean;
  onClose: () => void;
  drawerProps?: DrawerProps;
  modalProps?: ModalProps;
}

/**
 * 配置功能的容器组件
 * 会根据当前的设备自适应的选择抽屉（移动端）或者弹窗（pc 端）
 */
export const SettingContainer: FC<SettingContainerProps> = (props) => {
  const { title, open, onClose, drawerProps = {}, modalProps = {}, children } = props;
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer
        open={open}
        closable={false}
        bodyStyle={{ padding: 0 }}
        placement='left'
        destroyOnClose
        width='100%'
        {...drawerProps}>
        <PageTitle title={title} />
        {children}
      </Drawer>
    );
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={title}
      destroyOnClose
      {...modalProps}>
      <PageTitle title={title} />
      {children}
    </Modal>
  );
};
