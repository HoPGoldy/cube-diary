import React from 'react'
import { Col, Form, Input, Row } from 'antd'
import { useChangePassword } from '@/client/services/user'
import { sha } from '@/utils/crypto'
import { useAppDispatch } from '@/client/store'
import { logout } from '@/client/store/user'
import { messageSuccess } from '@/client/utils/message'
import { useIsMobile } from '@/client/layouts/Responsive'
import s from './styles.module.css'

export const useChangePasswordContent = () => {
    const [form] = Form.useForm()
    const dispatch = useAppDispatch()
    const isMobile = useIsMobile()
    const { mutateAsync: postChangePassword, isLoading: isChangingPassword } = useChangePassword()

    const onSavePassword = async () => {
        const values = await form.validateFields()
        const resp = await postChangePassword({
            oldP: sha(values.oldPassword),
            newP: sha(values.newPassword)
        })
        if (resp.code !== 200) return false

        dispatch(logout())
        messageSuccess('密码修改成功，请重新登录')
        return true
    }

    const renderContent = () => {
        return (
            <Form
                className={s.changePasswordBox}
                form={form}
                labelCol={{ span: 6 }}
                labelAlign="right"
                size={isMobile ? 'large' : 'middle'}
            >
                <Row className='md:mt-6'>
                    <Col span={24}>
                        <Form.Item
                            label="旧密码"
                            name="oldPassword"
                            rules={[{ required: true, message: '请填写旧密码' }]}
                        >
                            <Input.Password placeholder="请输入" />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            label="新密码"
                            name="newPassword"
                            hasFeedback
                            rules={[
                                { required: true, message: '请填写新密码' },
                                { min: 6, message: '密码长度至少6位' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('oldPassword') !== value) {
                                            return Promise.resolve()
                                        }
                                        return Promise.reject(new Error('新旧密码不能相同'))
                                    },
                                }),
                            ]}
                        >
                            <Input.Password placeholder="请输入" />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            label="重复新密码"
                            name="confirmPassword"
                            rules={[
                                { required: true, message: '请重复新密码' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('newPassword') === value) {
                                            return Promise.resolve()
                                        }
                                        return Promise.reject(new Error('与新密码不一致'))
                                    },
                                }),
                            ]}
                        >
                            <Input.Password placeholder="请输入" />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        )
    }

    return { onSavePassword, isChangingPassword, renderContent }
}
