import { useEffect, useRef, useState } from "react";
import { autoSaveContent } from "@/services/article";
import { useDebounceFn } from "ahooks";
import dayjs from "dayjs";
import { Modal } from "antd";
import copy from "copy-to-clipboard";
import { messageSuccess } from "@/utils/message";

interface Props {
  content: string;
  articleId: string;
}

export const useAutoSave = (props: Props) => {
  const [modal, contextHolder] = Modal.useModal();
  // 内容是否被编辑了
  const isContentModified = useRef(false);
  // 自动保存的引用，防止闭包陷阱
  const contentRef = useRef(props.content);
  if (contentRef.current !== props.content) {
    contentRef.current = props.content;
    isContentModified.current = true;
  }

  const [autoSaveTip, setAutoSaveTip] = useState("");

  const showSaveErrorModal = () => {
    modal.error({
      title: "自动保存失败",
      content: "请及时将内容保存到安全位置，避免数据丢失",
      okText: "复制内容",
      onOk: () => {
        copy(contentRef.current);
        messageSuccess("内容已复制到剪贴板");
      },
    });
  };

  const { run } = useDebounceFn(
    async () => {
      try {
        const resp = await autoSaveContent(props.articleId, contentRef.current);

        if (!resp.success) {
          showSaveErrorModal();
          return;
        }
        setAutoSaveTip(`自动保存于 ${dayjs().format("HH:mm")}`);
      } catch (e) {
        console.error("自动保存失败", e);
        showSaveErrorModal();
      }
    },
    { wait: 1000 },
  );

  useEffect(() => {
    setAutoSaveTip("");
  }, [props.articleId]);

  return {
    autoSaveTip,
    setAutoSaveTip,
    isContentModified,
    run,
    contextHolder,
  };
};
