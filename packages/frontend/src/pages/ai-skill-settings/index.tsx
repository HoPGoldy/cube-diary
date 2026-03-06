import { FC } from "react";
import { Alert, Flex, Modal, Typography } from "antd";
import { RobotOutlined } from "@ant-design/icons";

interface Props {
  open: boolean;
  onClose: () => void;
  onOpenTokenManager: () => void;
}

export const AiSkillSettingsModal: FC<Props> = ({
  open,
  onClose,
  onOpenTokenManager,
}) => {
  const basePath = APP_CONFIG.PATH_BASENAME.replace(/\/$/, "");
  const skillZipUrl = `${window.location.origin}${basePath}/api/skill.zip`;
  const copyText = `请下载并安装以下 skill 来帮我管理日记数据：${skillZipUrl}`;

  return (
    <Modal
      open={open}
      title="AI Skill 设置"
      onCancel={onClose}
      footer={null}
      width={520}
    >
      <Flex vertical gap={16}>
        <Alert
          type="info"
          showIcon
          icon={<RobotOutlined />}
          message={
            <span>
              将下方提示句发给你的 AI 助手，它会自动下载并安装
              skill，之后即可通过自然语言管理日记数据。使用前请先{" "}
              <Typography.Link
                onClick={() => {
                  onClose();
                  onOpenTokenManager();
                }}
              >
                创建 Access Token
              </Typography.Link>
              ，供 AI 助手完成认证。
            </span>
          }
        />

        <Flex vertical gap={8}>
          <Typography.Text type="secondary">
            复制以下内容发给你的 AI 助手：
          </Typography.Text>
          <Typography.Text
            copyable={{ text: copyText }}
            style={{ wordBreak: "break-all" }}
          >
            {copyText}
          </Typography.Text>
        </Flex>
      </Flex>
    </Modal>
  );
};
