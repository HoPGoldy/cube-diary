import React from "react";
import { Button, Result } from "antd";
import { Link } from "react-router-dom";

export const Error403: React.FC = () => (
  <Result
    status="warning"
    title="403 警告"
    subTitle="您没有权限访问该页面"
    extra={
      <Link to="/" replace>
        <Button type="primary" key="console">
          返回首页
        </Button>
      </Link>
    }
  />
);
