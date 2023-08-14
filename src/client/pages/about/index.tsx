import React, { useState } from 'react';
import { useAboutContent } from './content';
import { Modal } from 'antd';
import { useIsMobile } from '@/client/layouts/responsive';
import { MobilePageDrawer } from '@/client/components/mobileDrawer';
import { ActionButton } from '@/client/layouts/pageWithAction';

export const useAbout = () => {
  const isMobile = useIsMobile();
  /** 是否显示弹窗 */
  const [visible, setVisible] = useState(false);
  const { renderContent } = useAboutContent();

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
          title='关于'
          content={renderContent()}
          action={<ActionButton onClick={() => setVisible(false)}>返回</ActionButton>}
        />
      );
    }

    return (
      <Modal open={visible} onCancel={() => setVisible(false)} footer={null} title='关于'>
        {renderContent()}
      </Modal>
    );
  };

  return { showModal, renderModal };
};
