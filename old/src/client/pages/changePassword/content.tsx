import React, { FC } from 'react';
import { Button, Card, Col, Form, Input, Row, Space } from 'antd';
import { useChangePassword } from '@/client/services/user';
import { sha } from '@/utils/crypto';
import { logout } from '@/client/store/user';
import { messageSuccess } from '@/client/utils/message';
import { useIsMobile } from '@/client/layouts/responsive';
import s from './styles.module.css';
import { LeftOutlined } from '@ant-design/icons';
import { SettingContainerProps } from '@/client/components/settingContainer';
import { ActionButton, ActionIcon, PageAction, PageContent } from '@/client/layouts/pageWithAction';

export const Content: FC<SettingContainerProps> = (props) => {
  const [form] = Form.useForm();
  const isMobile = useIsMobile();
  const { mutateAsync: postChangePassword, isLoading: isChangingPassword } = useChangePassword();

  const onSavePassword = async () => {
    const values = await form.validateFields();
    const resp = await postChangePassword({
      oldP: sha(values.oldPassword),
      newP: sha(values.newPassword),
    });
    if (resp.code !== 200) return false;

    logout();
    messageSuccess('密码修改成功，请重新登录');
    return true;
  };

  const renderContent = () => {
    return (
      <Form
        className={s.changePasswordBox}
        form={form}
        labelCol={{ span: 6 }}
        labelAlign='right'
        size={isMobile ? 'large' : 'middle'}>
        <Row className='md:mt-6'>
          <Col span={24}>
            <Form.Item
              label='旧密码'
              name='oldPassword'
              rules={[{ required: true, message: '请填写旧密码' }]}>
              <Input.Password placeholder='请输入' />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label='新密码'
              name='newPassword'
              hasFeedback
              rules={[
                { required: true, message: '请填写新密码' },
                { min: 6, message: '密码长度至少6位' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('oldPassword') !== value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('新旧密码不能相同'));
                  },
                }),
              ]}>
              <Input.Password placeholder='请输入' />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label='重复新密码'
              name='confirmPassword'
              rules={[
                { required: true, message: '请重复新密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('与新密码不一致'));
                  },
                }),
              ]}>
              <Input.Password placeholder='请输入' />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  };

  if (!isMobile) {
    return (
      <>
        {renderContent()}
        <div className='flex flex-row-reverse mt-4'>
          <Space>
            <Button onClick={props.onClose}>返回</Button>
            <Button type='primary' onClick={onSavePassword} loading={isChangingPassword}>
              修改密码
            </Button>
          </Space>
        </div>
      </>
    );
  }

  return (
    <>
      <PageContent>
        <div className='m-4 md:m-0'>
          <Card size='small' className='text-center text-base font-bold mb-4'>
            {props.title}
          </Card>
          <Card size='small' className='text-base'>
            {renderContent()}
          </Card>
        </div>
      </PageContent>

      <PageAction>
        <ActionIcon icon={<LeftOutlined />} onClick={props.onClose} />
        <ActionButton onClick={onSavePassword} loading={isChangingPassword}>
          修改密码
        </ActionButton>
      </PageAction>
    </>
  );
};
