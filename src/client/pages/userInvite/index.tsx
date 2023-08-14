import React, { useState } from 'react';
import { useUserManageContent } from './content';
import { Modal } from 'antd';
import { useIsMobile } from '@/client/layouts/responsive';
import { MobilePageDrawer } from '@/client/components/mobileDrawer';
import { ActionButton, ActionIcon } from '@/client/layouts/pageWithAction';
import { LeftOutlined } from '@ant-design/icons';

export const useUserManage = () => {
  const isMobile = useIsMobile();
  /** 是否显示弹窗 */
  const [visible, setVisible] = useState(false);
  const { onAddInvite, isAddingInvite, renderContent } = useUserManageContent();

  /** 显示页面 */
  const showModal = () => {
    setVisible(true);
  };

  /** 渲染弹窗 */
  const renderModal = () => {
    if (isMobile) {
      return (
        <MobilePageDrawer
          open={visible}
          onClose={() => setVisible(false)}
          title='用户管理'
          content={renderContent()}
          action={
            <>
              <ActionIcon icon={<LeftOutlined />} onClick={() => setVisible(false)} />
              <ActionButton onClick={onAddInvite} loading={isAddingInvite}>
                新增邀请码
              </ActionButton>
            </>
          }
        />
      );
    }

    return (
      <Modal
        open={visible}
        onCancel={() => setVisible(false)}
        okText='新增邀请码'
        cancelText='返回'
        onOk={onAddInvite}
        title='用户管理'>
        {renderContent()}
      </Modal>
    );
  };

  return { showModal, renderModal };
};
