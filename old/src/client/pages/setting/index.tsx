import React, { FC, Fragment } from 'react';
import { Button, Card, Col, Row, Statistic, Switch } from 'antd';
import { SnippetsOutlined, HighlightOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { ActionButton, PageAction, PageContent } from '@/client/layouts/pageWithAction';
import { UserOutlined, RightOutlined, LogoutOutlined } from '@ant-design/icons';
import { Cell, SplitLine } from '@/client/components/cell';
import { SettingLinkItem, useSetting } from './useSetting';
import { AppTheme } from '@/types/user';
import { PageTitle } from '@/client/components/pageTitle';

interface DesktopProps {
  onClick: () => void;
}

export const DesktopSetting: FC<DesktopProps> = (props) => {
  /** 设置功能 */
  const setting = useSetting();

  const renderConfigItem = (item: SettingLinkItem) => {
    return (
      <Col span={24} key={item.label}>
        <Button block icon={item.icon} onClick={item.onClick}>
          {item.label}
        </Button>
      </Col>
    );
  };

  return (
    <div style={{ width: '16rem' }}>
      <div style={{ margin: '1rem 0rem' }}>
        <Row gutter={[16, 16]} justify='space-around'>
          <Col>
            <Statistic title='日记数量' value={setting.diaryCount} prefix={<SnippetsOutlined />} />
          </Col>
          <Col>
            <Statistic title='总字数' value={setting.diaryLength} prefix={<HighlightOutlined />} />
          </Col>
        </Row>
      </div>
      <Row>
        <Col span={24}>
          <div className='flex justify-between items-center mb-4'>
            黑夜模式
            <Switch
              checkedChildren='开启'
              unCheckedChildren='关闭'
              onChange={setting.onSwitchTheme}
              checked={setting.userTheme === AppTheme.Light ? false : true}
            />
          </div>
        </Col>
      </Row>
      <Row gutter={[0, 8]} onClick={props.onClick}>
        {setting.settingConfig.map(renderConfigItem)}

        <Col span={24}>
          <Button block danger onClick={setting.onLogout} icon={<CloseCircleOutlined />}>
            登出
          </Button>
        </Col>
      </Row>
      {setting.renderModal()}
    </div>
  );
};

interface MobileProps {
  onBack: () => void;
}

export const MobileSetting: FC<MobileProps> = (props) => {
  /** 设置功能 */
  const setting = useSetting();

  const renderConfigItem = (item: SettingLinkItem, index: number) => {
    return (
      <Fragment key={item.label}>
        <Cell
          title={
            <div>
              {item.icon} &nbsp;{item.label}
            </div>
          }
          onClick={item.onClick}
          extra={<RightOutlined />}
        />
        {index !== setting.settingConfig.length - 1 && <SplitLine />}
      </Fragment>
    );
  };

  return (
    <>
      <PageTitle title='设置' />

      <PageContent>
        <div className='text-base m-4'>
          <Card size='small'>
            <Row justify='space-around'>
              <Col>
                <Statistic
                  title='日记数量'
                  value={setting.diaryCount}
                  prefix={<SnippetsOutlined />}
                />
              </Col>
              <Col>
                <Statistic
                  title='总字数'
                  value={setting.diaryLength}
                  prefix={<HighlightOutlined />}
                />
              </Col>
            </Row>
          </Card>

          <Card size='small' className='mt-4'>
            <Cell
              title={
                <div>
                  <UserOutlined /> &nbsp;登录用户
                </div>
              }
              extra={setting.userName}
            />
          </Card>

          <Card size='small' className='mt-4'>
            <Cell
              title={
                <div>
                  <UserOutlined /> &nbsp;黑夜模式
                </div>
              }
              extra={
                <Switch
                  checkedChildren='开启'
                  unCheckedChildren='关闭'
                  onChange={setting.onSwitchTheme}
                  checked={setting.userTheme === AppTheme.Light ? false : true}
                />
              }
            />
            <SplitLine />

            {setting.settingConfig.map(renderConfigItem)}
          </Card>

          <Card size='small' className='mt-4'>
            <Cell
              onClick={setting.onLogout}
              title={
                <div>
                  <UserOutlined /> &nbsp;登出
                </div>
              }
              extra={<LogoutOutlined />}
            />
          </Card>
          {setting.renderModal()}
        </div>
      </PageContent>

      <PageAction>
        <ActionButton onClick={props.onBack}>返回</ActionButton>
      </PageAction>
    </>
  );
};
