import React, { FC } from 'react';
import { Card } from 'antd';
import { GithubOutlined, SendOutlined } from '@ant-design/icons';
import { Cell } from '@/client/components/cell';
import { SettingContainerProps } from '@/client/components/settingContainer';
import { useIsMobile } from '@/client/layouts/responsive';
import { ActionButton, PageAction, PageContent } from '@/client/layouts/pageWithAction';

export const Content: FC<SettingContainerProps> = (props) => {
  const isMobile = useIsMobile();

  const renderContent = () => {
    return (
      <>
        <div className='text-base mx-auto'>
          <Card size='small' className='mt-4 text-base'>
            又快又好用的简单日记本 APP。
            <br />
            <br />
            包含支持图片上传的 Markdown 编辑器、双端响应式布局、数据自托管、导入导出等功能。
          </Card>
          <Card size='small' className='mt-4'>
            <a href='mailto:hopgoldy@gmail.com?&subject=cube-dnote 相关'>
              <Cell
                title={
                  <div className='dark:text-neutral-300'>
                    <SendOutlined /> &nbsp;联系我
                  </div>
                }
                extra={
                  <div className='text-gray-500 dark:text-neutral-200'>hopgoldy@gmail.com</div>
                }
              />
            </a>
          </Card>
          <Card size='small' className='mt-4'>
            <a href='https://github.com/HoPGoldy/cube-diary' target='_blank' rel='noreferrer'>
              <Cell
                title={
                  <div className='dark:text-neutral-300'>
                    <GithubOutlined /> &nbsp;开源地址
                  </div>
                }
                extra={<div className='text-gray-500 dark:text-neutral-200'>github</div>}
              />
            </a>
          </Card>
        </div>

        <div className='text-center w-full bottom-0 text-mainColor mt-4 md:mb-4 dark:text-gray-200'>
          {'Powered by 💗 Yuzizi'}
        </div>
      </>
    );
  };

  if (!isMobile) {
    return renderContent();
  }

  return (
    <>
      <PageContent>
        <div className='m-4 md:m-0'>
          <Card size='small' className='text-center text-base font-bold mb-4'>
            {props.title}
          </Card>
          {renderContent()}
        </div>
      </PageContent>

      <PageAction>
        <ActionButton onClick={props.onClose}>返回</ActionButton>
      </PageAction>
    </>
  );
};
