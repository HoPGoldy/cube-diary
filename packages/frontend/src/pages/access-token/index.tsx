import { FC, useState } from "react";
import {
  Button,
  Checkbox,
  Flex,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tag,
  Typography,
  Alert,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import {
  ACCESS_TOKEN_SCOPES,
  ACCESS_TOKEN_SCOPE_LABELS,
  DEFAULT_ACCESS_TOKEN_SCOPES,
  type AccessTokenScope,
  useAccessTokenList,
  useCreateAccessToken,
  useDeleteAccessToken,
} from "@/services/access-token";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const AccessTokenModal: FC<Props> = ({ open, onClose }) => {
  const queryClient = useQueryClient();
  const { data: listResp, isLoading } = useAccessTokenList();
  const { mutateAsync: createToken } = useCreateAccessToken();
  const { mutateAsync: deleteToken } = useDeleteAccessToken();

  const [createVisible, setCreateVisible] = useState(false);
  const [newTokenVisible, setNewTokenVisible] = useState(false);
  const [scopeVisible, setScopeVisible] = useState(false);
  const [selectedScopes, setSelectedScopes] = useState<AccessTokenScope[]>([]);
  const [newToken, setNewToken] = useState<{
    name: string;
    token: string;
    tokenPrefix: string;
  } | null>(null);
  const [form] = Form.useForm();

  const tokenList = listResp?.data || [];

  // 直接复用 shared-types 中的枚举和标签，避免前端硬编码一份 scope 定义。
  const scopeOptions = ACCESS_TOKEN_SCOPES.map((scope) => ({
    label: ACCESS_TOKEN_SCOPE_LABELS[scope],
    value: scope,
  }));

  const handleCreate = async () => {
    const values = await form.validateFields();
    const resp = await createToken({
      name: values.name,
      scopes: values.scopes,
    });
    if (resp?.success && resp.data) {
      setNewToken({
        name: resp.data.name,
        token: resp.data.token,
        tokenPrefix: resp.data.tokenPrefix,
      });
      setCreateVisible(false);
      setNewTokenVisible(true);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ["access-tokens"] });
    }
  };

  const handleDelete = async (id: string) => {
    await deleteToken(id);
    queryClient.invalidateQueries({ queryKey: ["access-tokens"] });
  };

  const handleShowScopes = (scopes: AccessTokenScope[]) => {
    setSelectedScopes(scopes ?? []);
    setScopeVisible(true);
  };

  const getScopeLabel = (scope: AccessTokenScope) => {
    return ACCESS_TOKEN_SCOPE_LABELS[scope];
  };

  const columns = [
    {
      title: "名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "令牌前缀",
      dataIndex: "tokenPrefix",
      key: "tokenPrefix",
      render: (val: string) => <Typography.Text code>{val}...</Typography.Text>,
    },
    {
      title: "最后使用",
      dataIndex: "lastUsedAt",
      key: "lastUsedAt",
      render: (val: string | null) =>
        val ? new Date(val).toLocaleDateString() : "从未使用",
    },
    {
      title: "操作",
      key: "action",
      width: 120,
      render: (_: any, record: any) => (
        <Space size={0}>
          <Button
            type="link"
            size="small"
            onClick={() =>
              handleShowScopes(record.scopes as AccessTokenScope[])
            }
          >
            权限
          </Button>
          <Popconfirm
            title="确认删除该访问令牌？"
            description="删除后无法恢复，使用该访问令牌的服务接入将立即失效。"
            onConfirm={() => handleDelete(record.id)}
            okText="删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" danger size="small">
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Modal
        open={open}
        title="访问令牌管理"
        onCancel={onClose}
        footer={null}
        width={880}
      >
        <Flex vertical gap={12}>
          <Flex justify="flex-end">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateVisible(true)}
            >
              新建访问令牌
            </Button>
          </Flex>
          <Table
            dataSource={tokenList}
            columns={columns}
            rowKey="id"
            loading={isLoading}
            pagination={false}
            size="small"
          />
        </Flex>
      </Modal>

      {/* 新建访问令牌表单 */}
      <Modal
        open={createVisible}
        title="新建访问令牌"
        onCancel={() => {
          setCreateVisible(false);
          form.resetFields();
        }}
        onOk={handleCreate}
        okText="创建"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ scopes: DEFAULT_ACCESS_TOKEN_SCOPES }}
        >
          <Form.Item
            label="备注名称"
            name="name"
            rules={[{ required: true, message: "请输入备注名称" }]}
          >
            <Input placeholder="例如：Claude Desktop" />
          </Form.Item>
          <Form.Item
            label="权限范围"
            name="scopes"
            rules={[{ required: true, message: "请至少选择一项权限" }]}
          >
            <Checkbox.Group options={scopeOptions} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={scopeVisible}
        title="权限范围"
        onCancel={() => setScopeVisible(false)}
        footer={
          <Button type="primary" onClick={() => setScopeVisible(false)}>
            关闭
          </Button>
        }
      >
        <Flex vertical gap={12}>
          <Space size={[4, 4]} wrap>
            {selectedScopes.map((scope) => {
              const label = getScopeLabel(scope);
              return <Tag key={scope}>{label}</Tag>;
            })}
          </Space>
          <Typography.Text type="secondary">
            权限范围无法修改，需要修改请新增并替换 key
          </Typography.Text>
        </Flex>
      </Modal>

      {/* 展示新生成的访问令牌（仅一次） */}
      <Modal
        open={newTokenVisible}
        title="访问令牌已创建"
        onCancel={() => setNewTokenVisible(false)}
        footer={
          <Button type="primary" onClick={() => setNewTokenVisible(false)}>
            我已复制，关闭
          </Button>
        }
        closable={false}
      >
        <Flex vertical gap={12}>
          <Alert
            type="warning"
            showIcon
            message="请立即复制此访问令牌，关闭后将无法再次查看完整内容。"
          />
          <div>
            <Typography.Text type="secondary">令牌名称：</Typography.Text>
            <Typography.Text strong>{newToken?.name}</Typography.Text>
          </div>
          <div>
            <Typography.Text type="secondary">完整令牌：</Typography.Text>
            <Space>
              <Typography.Text code copyable>
                {newToken?.token}
              </Typography.Text>
            </Space>
          </div>
        </Flex>
      </Modal>
    </>
  );
};
