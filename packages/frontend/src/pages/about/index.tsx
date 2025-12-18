import { FC } from "react";
import { Flex, Modal } from "antd";
import {
  SendOutlined,
  GithubOutlined,
  BarcodeOutlined,
} from "@ant-design/icons";
import { useAppVersion } from "@/services/app-config";

interface AboutModalModalProps {
  open: boolean;
  onClose: () => void;
}

interface AboutItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  link?: string;
}

export const AboutModal: FC<AboutModalModalProps> = (props) => {
  const { appVersion } = useAppVersion();

  const aboutItems: AboutItem[] = [
    {
      icon: <SendOutlined />,
      title: "联系我",
      description: "hopgoldy@gmail.com",
      link: `mailto:hopgoldy@gmail.com?&subject=${appVersion?.name || ""} 相关`,
    },
    {
      icon: <BarcodeOutlined />,
      title: "当前版本",
      description: appVersion?.version || "",
    },
    {
      icon: <GithubOutlined />,
      title: "开源地址",
      description: "github",
      link: appVersion?.repository || "",
    },
  ];

  const renderAboutItem = (item: AboutItem) => {
    const el = (
      <div
        className="p-2 text-gray-500 dark:text-neutral-200 bg-gray-100 rounded-md"
        key={item.title}
      >
        <Flex justify="space-between">
          <div className="dark:text-neutral-300">
            {item.icon} &nbsp;{item.title}
          </div>
          <div>{item.description}</div>
        </Flex>
      </div>
    );

    if (item.link) {
      return (
        <a key={item.title} href={item.link}>
          {el}
        </a>
      );
    }

    return el;
  };

  return (
    <Modal
      open={props.open}
      onCancel={() => props.onClose()}
      onOk={() => props.onClose()}
      title={`关于应用 ${appVersion?.name || ""}`}
      footer={(_, { OkBtn }) => (
        <Flex align="center" justify="space-between">
          <div className="text-gray-500 dark:text-gray-200">
            Powered by 💗 Yuzizi
          </div>
          <OkBtn />
        </Flex>
      )}
    >
      <Flex gap={16} vertical className="mb-4">
        <div className="mt-4 mb-2 text-base">
          专为个人构建的轻量级笔记应用。包含支持文件上传的 Markdown
          编辑器、双端响应式布局、数据自托管、支持搜索、标签、笔记嵌套等功能。
        </div>

        {aboutItems.map(renderAboutItem)}
      </Flex>
    </Modal>
  );
};
