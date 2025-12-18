import { ActionIcon, ActionButton } from "@/layouts/page-with-action";
import { LeftOutlined, CloudUploadOutlined } from "@ant-design/icons";
import { ChangeEventHandler, FC, useRef, useState } from "react";

interface Props {
  updatingArticle: boolean;
  autoSaveTip: string;
  onUploadFile: (files: File[]) => Promise<void>;
  onClickSaveBtn: () => Promise<void>;
  onClickExitBtn: () => Promise<void>;
}

export const AreaMobileActionBar: FC<Props> = (props) => {
  /** 移动端的附件选择器 */
  const fileSelectRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  /** 移动端选中了附件 */
  const onFileSelect: ChangeEventHandler<HTMLInputElement> = async (event) => {
    event.preventDefault();

    const files = event.target.files;
    if (!files) return;

    try {
      setUploading(true);
      await props.onUploadFile(Array.from(files));
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileSelectRef}
        style={{ display: "none" }}
        onChange={onFileSelect}
      ></input>
      <ActionIcon icon={<LeftOutlined />} onClick={props.onClickExitBtn} />
      <ActionIcon
        loading={uploading}
        icon={<CloudUploadOutlined />}
        onClick={() => fileSelectRef.current?.click()}
      />
      <ActionButton
        onClick={props.onClickSaveBtn}
        loading={props.updatingArticle}
      >
        保存
        {props.autoSaveTip && (
          <span className="ml-2 text-xs">{props.autoSaveTip}</span>
        )}
      </ActionButton>
    </>
  );
};
