import { useState, useRef, ChangeEventHandler, FC } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  message,
} from "antd";
import { ExclamationCircleFilled, LeftOutlined } from "@ant-design/icons";
import { useImportDiary } from "@/services/diary";
import { MarkdownPreview } from "@/components/markdown-editor";
import dayjs from "dayjs";
import type { SchemaDiaryImportBodyType } from "@shared-types/diary";
import styles from "./styles.module.css";

/**
 * 为导入导出 json 创建示例
 */
export const createExample = (
  formValues: SchemaDiaryImportBodyType,
): string => {
  const newExamples = Array.from({ length: 3 }).map((_, index) => {
    const date = dayjs().subtract(index, "d").startOf("day");
    return {
      [formValues.dateKey || "date"]: formValues.dateFormatter
        ? date.format(formValues.dateFormatter)
        : date.valueOf(),
      [formValues.contentKey || "content"]: `这是 ${date.format(
        "年 MM 月 DD 日的一篇日记",
      )}`,
      [formValues.colorKey || "color"]: `c0${index + 1}`,
    };
  });

  return "```json\n" + JSON.stringify(newExamples, null, 2) + "\n```";
};

const getFormInitialValues = (): SchemaDiaryImportBodyType => {
  return {
    existOperation: "cover",
    dateKey: "date",
    contentKey: "content",
    colorKey: "color",
    dateFormatter: "YYYY-MM-DD",
  };
};

const initialValues = getFormInitialValues();

const EXIST_OPERATION_OPTIONS = [
  { label: "覆盖", value: "cover" },
  { label: "合并", value: "merge" },
  { label: "跳过", value: "skip" },
];

interface Props {
  onClose: () => void;
}

export const DiaryImport: FC<Props> = ({ onClose }) => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [example, setExample] = useState(() =>
    createExample(getFormInitialValues()),
  );
  const fileSelectRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: uploadJson, isPending: isLoading } = useImportDiary();
  const [messageApi, contextHolder] = message.useMessage();

  const onFormValueChange = (
    _values: Partial<SchemaDiaryImportBodyType>,
    allValues: SchemaDiaryImportBodyType,
  ) => {
    const newExample = createExample(allValues);
    setExample(newExample);
  };

  const onSelectFile = () => {
    fileSelectRef.current?.click();
  };

  const runUpload = async (file: File, config: SchemaDiaryImportBodyType) => {
    messageApi.loading("导入中，请不要关闭页面...", 0);
    try {
      const resp = await uploadJson({ file, config });
      messageApi.destroy();

      if (resp.success && resp.data) {
        const {
          updateCount = 0,
          insertCount = 0,
          insertNumber = 0,
        } = resp.data;
        Modal.success({
          title: "导入成功",
          content: (
            <div className="text-left">
              共计导入 {updateCount + insertCount} 条，
              {insertNumber >= 0 ? "新增" : "减少"} {Math.abs(insertNumber)}
              字，其中：新增 {insertCount} 条，更新 {updateCount} 条
            </div>
          ),
          onOk: () => {
            navigate("/diary/month/" + dayjs().format("YYYYMM"));
          },
        });
      }
    } catch {
      messageApi.destroy();
      message.error("导入失败");
    }
  };

  const onFileChange: ChangeEventHandler<HTMLInputElement> = async (event) => {
    event.preventDefault();

    const uploadFile = event.target.files?.[0];
    if (!uploadFile) return;

    const formValues = form.getFieldsValue();

    // 覆盖掉已经上传的问题，不然第二次上传就会没反应
    event.target.value = "";

    const defaultValues = getFormInitialValues();
    const config: SchemaDiaryImportBodyType = {
      existOperation: formValues.existOperation || defaultValues.existOperation,
      dateKey: formValues.dateKey || defaultValues.dateKey,
      contentKey: formValues.contentKey || defaultValues.contentKey,
      colorKey: formValues.colorKey || defaultValues.colorKey,
      dateFormatter: formValues.dateFormatter || defaultValues.dateFormatter,
    };

    Modal.confirm({
      title: "是否执行导入？",
      icon: <ExclamationCircleFilled />,
      content: "推荐导入前手动备份数据，以防止数据丢失",
      onOk() {
        runUpload(uploadFile, config);
      },
    });
  };

  return (
    <div className="p-6">
      {contextHolder}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={24} lg={12}>
          <Card size="small" title="导入配置">
            <Form
              className={styles.formBox}
              form={form}
              initialValues={initialValues}
              onValuesChange={onFormValueChange}
              labelAlign="left"
            >
              <Row gutter={[16, 16]}>
                <Col span={9}>当日记存在时</Col>
                <Col span={15}>
                  <Form.Item name="existOperation" noStyle>
                    <Select
                      style={{ width: "100%" }}
                      options={EXIST_OPERATION_OPTIONS}
                    />
                  </Form.Item>
                </Col>
                <Col span={9}>日期字段名</Col>
                <Col span={15}>
                  <Form.Item name="dateKey" noStyle>
                    <Input placeholder="默认使用 date" />
                  </Form.Item>
                </Col>
                <Col span={9}>日期解析</Col>
                <Col span={15}>
                  <Form.Item name="dateFormatter" noStyle>
                    <Input placeholder="默认解析毫秒时间戳" />
                  </Form.Item>
                </Col>
                <Col span={9}>正文字段名</Col>
                <Col span={15}>
                  <Form.Item name="contentKey" noStyle>
                    <Input placeholder="默认使用 content" />
                  </Form.Item>
                </Col>
                <Col span={9}>颜色字段名</Col>
                <Col span={15}>
                  <Form.Item name="colorKey" noStyle>
                    <Input placeholder="默认使用 color" />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>
        <Col xs={24} md={24} lg={12}>
          <Card
            size="small"
            className={styles.previewArea}
            title="示例"
            extra="请确保要导入的内容格式如下"
          >
            <MarkdownPreview source={example} />
          </Card>
        </Col>
      </Row>

      <input
        type="file"
        ref={fileSelectRef}
        accept=".json"
        style={{ display: "none" }}
        onChange={onFileChange}
      />

      <div className="flex flex-row-reverse mt-4">
        <Space>
          <Button icon={<LeftOutlined />} onClick={onClose}>
            返回
          </Button>
          <Button type="primary" onClick={onSelectFile} loading={isLoading}>
            导入
          </Button>
        </Space>
      </div>
    </div>
  );
};
