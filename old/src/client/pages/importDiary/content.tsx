import React, { useState, useRef, ChangeEventHandler, FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Col, Form, Input, Modal, Row, Select, Space, message } from 'antd';
import { STATUS_CODE } from '@/config';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { useImportDiary } from '@/client/services/diary';
import s from './styles.module.css';

import dayjs from 'dayjs';
import { JsonImportForm } from '@/types/diary';
import Preview from '../monthList/preview';
import { SettingContainerProps } from '@/client/components/settingContainer';
import { LeftOutlined } from '@ant-design/icons';
import { useIsMobile } from '@/client/layouts/responsive';
import { ActionButton, ActionIcon, PageAction, PageContent } from '@/client/layouts/pageWithAction';

/**
 * 为导入导出 json 创建示例
 */
export const createExample = (formValues: JsonImportForm): string => {
  const newExamples = Array.from({ length: 3 }).map((_, index) => {
    const date = dayjs().subtract(index, 'd').startOf('day');
    return {
      [formValues.dateKey || 'date']: formValues.dateFormatter
        ? date.format(formValues.dateFormatter)
        : date.valueOf(),
      [formValues.contentKey || 'content']: `这是 ${date.format('YYYY 年 MM 月 DD 日的一篇日记')}`,
      [formValues.colorKey || 'color']: `c0${index + 1}`,
    };
  });

  return '```json\n' + JSON.stringify(newExamples, null, 2) + '\n```';
};

const getFormInitialValues = (): JsonImportForm => {
  return {
    existOperation: 'cover',
    dateKey: 'date',
    contentKey: 'content',
    colorKey: 'color',
    dateFormatter: 'YYYY-MM-DD',
  };
};

const initialValues = getFormInitialValues();

const EXIST_OPERATION_OPTIONS = [
  { label: '覆盖', value: 'cover' },
  { label: '合并', value: 'merge' },
  { label: '跳过', value: 'skip' },
];

export const Content: FC<SettingContainerProps> = (props) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  /** 和用户配置项相符的示例 */
  const [example, setExample] = useState(() => createExample(getFormInitialValues()));
  /** 上传组件 */
  const fileSelectRef = useRef<HTMLInputElement>(null);
  /** 上传接口 */
  const { mutateAsync: uploadJson, isLoading } = useImportDiary();
  /** 导入中提示 */
  const [messageApi, contextHolder] = message.useMessage();

  const onFormValueChange = (values: Partial<JsonImportForm>, allValues: JsonImportForm) => {
    const newExample = createExample(allValues);
    setExample(newExample);
  };

  const onSelectFile = () => {
    fileSelectRef.current?.click();
  };

  const runUpload = async (formData: FormData) => {
    messageApi.loading('导入中，请不要关闭页面...', 0);
    const resp = await uploadJson(formData);
    messageApi.destroy();
    if (resp.code !== STATUS_CODE.SUCCESS) return;

    const { updateCount = 0, insertCount = 0, insertNumber = 0 } = resp.data || {};
    Modal.success({
      title: '导入成功',
      content: (
        <div className='text-left'>
          共计导入 {updateCount + insertCount} 条，{insertNumber >= 0 ? '新增' : '减少'}{' '}
          {insertNumber} 字，其中：新增 {insertCount} 条，更新 {updateCount} 条
        </div>
      ),
    });

    navigate('/');
  };

  const onFileChange: ChangeEventHandler<HTMLInputElement> = async (event) => {
    event.preventDefault();

    const uploadFile = event.target.files?.[0];
    if (!uploadFile) return;

    const formValues = form.getFieldsValue();

    // 覆盖掉已经上传的问题，不然第二次上传就会没反应
    event.target.value = '';

    const defaultValues = getFormInitialValues();
    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('existOperation', formValues.existOperation || defaultValues.existOperation);
    formData.append('dateKey', formValues.dateKey || defaultValues.dateKey);
    formData.append('contentKey', formValues.contentKey || defaultValues.contentKey);
    formData.append('dateFormatter', formValues.dateFormatter || defaultValues.dateFormatter);

    Modal.confirm({
      title: '是否执行导入？',
      icon: <ExclamationCircleFilled />,
      content: '推荐导入前手动备份数据，以防止数据丢失',
      onOk() {
        runUpload(formData);
      },
    });
  };

  const renderContent = () => {
    return (
      <div>
        {contextHolder}
        <Row gutter={[16, 16]}>
          <Col xs={24} md={24} lg={12}>
            <Card size='small' title='导入配置'>
              <Form
                className={s.importDiaryBox}
                form={form}
                initialValues={initialValues}
                onValuesChange={onFormValueChange}
                labelAlign='left'>
                <Row gutter={[16, 16]}>
                  <Col span={9}>当日记存在时</Col>
                  <Col span={15}>
                    <Form.Item name='existOperation' noStyle>
                      <Select style={{ width: '100%' }} options={EXIST_OPERATION_OPTIONS}></Select>
                    </Form.Item>
                  </Col>
                  <Col span={9}>日期字段名</Col>
                  <Col span={15}>
                    <Form.Item name='dateKey' noStyle>
                      <Input placeholder='默认使用 date' />
                    </Form.Item>
                  </Col>
                  <Col span={9}>日期解析</Col>
                  <Col span={15}>
                    <Form.Item name='dateFormatter' noStyle>
                      <Input placeholder='默认解析毫秒时间戳' />
                    </Form.Item>
                  </Col>
                  <Col span={9}>正文字段名</Col>
                  <Col span={15}>
                    <Form.Item name='contentKey' noStyle>
                      <Input placeholder='默认使用 content' />
                    </Form.Item>
                  </Col>
                  <Col span={9}>颜色字段名</Col>
                  <Col span={15}>
                    <Form.Item name='colorKey' noStyle>
                      <Input placeholder='默认使用 color' />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Card>
          </Col>
          <Col xs={24} md={24} lg={12}>
            <Card
              size='small'
              className={s.previewArea}
              title='示例'
              extra='请确保要导入的内容格式如下'>
              <Preview value={example}></Preview>
            </Card>
          </Col>
        </Row>

        <input
          type='file'
          ref={fileSelectRef}
          accept='.json'
          style={{ display: 'none' }}
          onChange={onFileChange}></input>
      </div>
    );
  };

  if (!isMobile) {
    return (
      <>
        {renderContent()}
        <div className='flex flex-row-reverse mt-4'>
          <Space>
            <Button onClick={props.onClose}>返回</Button>
            <Button type='primary' onClick={onSelectFile} loading={isLoading}>
              导入
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
          {renderContent()}
        </div>
      </PageContent>

      <PageAction>
        <ActionIcon icon={<LeftOutlined />} onClick={props.onClose} />
        <ActionButton onClick={onSelectFile} loading={isLoading}>
          导入
        </ActionButton>
      </PageAction>
    </>
  );
};
