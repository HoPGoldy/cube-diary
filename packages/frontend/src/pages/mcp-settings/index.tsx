import { FC, useEffect, useState } from "react";
import { Alert, Flex, Modal, Switch, Typography } from "antd";
import { ApiOutlined } from "@ant-design/icons";
import { useGetAppConfig, useUpdateAppConfig } from "@/services/app-config";
import { MarkdownPreview } from "@/components/markdown-editor";

interface Props {
  open: boolean;
  onClose: () => void;
  onOpenTokenManager: () => void;
}

export const McpSettingsModal: FC<Props> = ({
  open,
  onClose,
  onOpenTokenManager,
}) => {
  const { appConfig } = useGetAppConfig();
  const { mutateAsync: updateConfig } = useUpdateAppConfig();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(appConfig?.["mcp.enabled"] === "true");
  }, [appConfig]);

  const handleToggle = async (checked: boolean) => {
    setEnabled(checked);
    await updateConfig({ "mcp.enabled": checked ? "true" : "false" });
  };

  // 去掉末尾斜杠，避免拼出双斜杠
  const basePath = APP_CONFIG.PATH_BASENAME.replace(/\/$/, "");
  const mcpEndpoint = `${window.location.origin}${basePath}/api/mcp`;

  const mcpConfigJson = JSON.stringify(
    {
      mcpServers: {
        "cube-diary": {
          type: "http",
          url: mcpEndpoint,
          headers: {
            Authorization: "Bearer <your-access-token>",
          },
        },
      },
    },
    null,
    2,
  );

  const mcpConfigMarkdown = "```json\n" + mcpConfigJson + "\n```";

  return (
    <Modal
      open={open}
      title="MCP 设置"
      onCancel={onClose}
      footer={null}
      width={520}
    >
      <Flex vertical gap={16}>
        <Alert
          type="info"
          showIcon
          icon={<ApiOutlined />}
          message={
            <span>
              MCP（Model Context Protocol）允许 AI 助手直接读写日记和附件。需先{" "}
              <Typography.Link onClick={onOpenTokenManager}>
                创建 Access Token
              </Typography.Link>{" "}
              后方可接入。
            </span>
          }
        />

        {/* 开关 */}
        <Flex justify="space-between" align="center">
          <Typography.Text strong>启用 MCP 服务</Typography.Text>
          <Switch checked={enabled} onChange={handleToggle} />
        </Flex>

        {/* 客户端配置 */}
        {enabled && (
          <Flex vertical gap={4}>
            <Typography.Text type="secondary">
              客户端配置（复制到 AI 客户端的 MCP 配置文件中）
            </Typography.Text>
            <MarkdownPreview source={mcpConfigMarkdown} />
          </Flex>
        )}
      </Flex>
    </Modal>
  );
};
