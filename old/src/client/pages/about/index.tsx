import React from 'react';
import { Content } from './content';
import { SettingContainer, SettingContainerProps } from '@/client/components/settingContainer';
import { useSearchParams } from 'react-router-dom';

const TITLE = '关于';

const PARAM_KEY = 'showAbout';

export default () => {
  const [searchParams, setSearchParams] = useSearchParams();
  /** 是否显示弹窗 */
  const visible = searchParams.get(PARAM_KEY) === '1';

  const showModal = () => {
    searchParams.set(PARAM_KEY, '1');
    setSearchParams(searchParams);
  };

  const closeModal = () => {
    searchParams.delete(PARAM_KEY);
    setSearchParams(searchParams, { replace: true });
  };

  /** 渲染弹窗 */
  const renderModal = () => {
    const props: SettingContainerProps = {
      title: TITLE,
      open: visible,
      onClose: closeModal,
    };

    return (
      <SettingContainer {...props}>
        <Content {...props} />
      </SettingContainer>
    );
  };

  return { showModal, renderModal };
};
