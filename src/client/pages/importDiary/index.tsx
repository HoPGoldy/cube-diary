import React, { useState } from 'react';
import { Content } from './content';
import { SettingContainer, SettingContainerProps } from '@/client/components/settingContainer';

const TITLE = '日记导入';

export default () => {
  /** 是否显示弹窗 */
  const [visible, setVisible] = useState(false);
  /** 显示页面 */
  const showModal = () => setVisible(true);

  /** 渲染弹窗 */
  const renderModal = () => {
    const props: SettingContainerProps = {
      title: TITLE,
      open: visible,
      onClose: () => setVisible(false),
      modalProps: { width: '80%' },
    };

    return (
      <SettingContainer {...props}>
        <Content {...props} />
      </SettingContainer>
    );
  };

  return { showModal, renderModal };
};
