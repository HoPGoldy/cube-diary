import { SearchOutlined } from "@ant-design/icons";
import { useDebounceFn } from "ahooks";
import { Form, Input } from "antd";
import { FC, PropsWithChildren } from "react";

interface TableSearchProps {
  onChange: (values: any) => unknown;
}

export const TableSearch: FC<PropsWithChildren<TableSearchProps>> = (props) => {
  const { run: debounceValuesChange } = useDebounceFn(
    (values) => props.onChange(values),
    {
      wait: 500,
    },
  );

  return (
    <Form onValuesChange={debounceValuesChange} layout="inline">
      <Form.Item name="keyword">
        <Input suffix={<SearchOutlined />} placeholder="搜索关键字" />
      </Form.Item>
      {props.children}
    </Form>
  );
};
