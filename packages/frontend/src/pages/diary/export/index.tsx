import { FC, useState } from "react";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  Radio,
  Row,
  Space,
  message,
} from "antd";
import { useExportDiary } from "@/services/diary";
import { MarkdownPreview } from "@/components/markdown-editor";
import dayjs, { Dayjs } from "dayjs";
import type { SchemaDiaryExportBodyType } from "@shared-types/diary";
import { LeftOutlined } from "@ant-design/icons";
import styles from "./styles.module.css";

type JsonExportForm = Omit<
  SchemaDiaryExportBodyType,
  "startDate" | "endDate"
> & {
  startDate?: Dayjs;
  endDate?: Dayjs;
};

const saveAsJson = (data: unknown, fileName = "diary.json") => {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const a = document.createElement("a");
  a.download = fileName;
  a.href = URL.createObjectURL(blob);
  a.dataset.downloadurl = ["application/json", a.download, a.href].join(":");
  a.click();
  URL.revokeObjectURL(a.href);
};

/**
 * 为导入导出 json 创建示例
 */
const createExample = (formValues: JsonExportForm): string => {
  const newExamples = Array.from({ length: 3 }).map((_, index) => {
    const date = dayjs().subtract(index, "d").startOf("day");
    return {
      [formValues.dateKey || "date"]: formValues.dateFormatter
        ? date.format(formValues.dateFormatter)
        : date.valueOf(),
      [formValues.contentKey || "content"]: `这是 ${date.format(
        "YYYY 年 MM 月 DD 日的一篇日记",
      )}`,
      [formValues.colorKey || "color"]: `c0${index + 1}`,
    };
  });

  return "```json\n" + JSON.stringify(newExamples, null, 2) + "\n```";
};

const getFormInitialValues = (): JsonExportForm => {
  return {
    range: "part",
    startDate: dayjs().subtract(1, "month"),
    endDate: dayjs(),
    dateKey: "date",
    contentKey: "content",
    colorKey: "color",
    dateFormatter: "YYYY-MM-DD",
  };
};

const initialValues = getFormInitialValues();

interface Props {
  onClose: () => void;
}

export const DiaryExport: FC<Props> = ({ onClose }) => {
  const [form] = Form.useForm();
  const [example, setExample] = useState(() =>
    createExample(getFormInitialValues()),
  );
  const { mutateAsync: exportJson, isPending: isLoading } = useExportDiary();
  const isRangeExport = Form.useWatch("range", form) === "part";

  const onFormValueChange = (
    _values: Partial<JsonExportForm>,
    allValues: JsonExportForm,
  ) => {
    const newExample = createExample(allValues);
    setExample(newExample);
  };

  const onExport = async () => {
    try {
      const values = await form.validateFields();
      const { startDate, endDate, ...rest } = values;
      const reqData: SchemaDiaryExportBodyType = { ...rest };

      if (reqData.range === "part") {
        reqData.startDate = startDate?.valueOf();
        reqData.endDate = endDate?.valueOf();
      }

      const resp = await exportJson(reqData);
      if (resp.success && resp.data) {
        message.success("导出成功");
        saveAsJson(resp.data, "diary.json");
      }
    } catch {
      message.error("导出失败");
    }
  };

  return (
    <div className="py-2">
      <Row gutter={[16, 16]}>
        <Col xs={24} md={24} lg={12}>
          <Card size="small" title="导出配置">
            <Form
              className={styles.formBox}
              form={form}
              initialValues={initialValues}
              onValuesChange={onFormValueChange}
              labelAlign="left"
            >
              <Row gutter={[16, 16]}>
                <Col span={9}>导出范围</Col>
                <Col span={15}>
                  <Form.Item name="range" noStyle>
                    <Radio.Group className="float-right">
                      <Radio value="all">全部</Radio>
                      <Radio value="part">部分</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>
                {isRangeExport && (
                  <>
                    <Col span={9}>开始日期</Col>
                    <Col span={15}>
                      <Form.Item
                        name="startDate"
                        noStyle
                        rules={[{ required: true, message: "请选择开始日期" }]}
                      >
                        <DatePicker className="w-full" />
                      </Form.Item>
                    </Col>
                    <Col span={9}>结束日期</Col>
                    <Col span={15}>
                      <Form.Item
                        name="endDate"
                        noStyle
                        rules={[{ required: true, message: "请选择结束日期" }]}
                      >
                        <DatePicker className="w-full" />
                      </Form.Item>
                    </Col>
                  </>
                )}
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
            extra="将导出为以下格式"
          >
            <MarkdownPreview source={example} />
          </Card>
        </Col>
      </Row>

      <div className="flex flex-row-reverse mt-4">
        <Space>
          <Button icon={<LeftOutlined />} onClick={onClose}>
            返回
          </Button>
          <Button type="primary" onClick={onExport} loading={isLoading}>
            导出
          </Button>
        </Space>
      </div>
    </div>
  );
};
