import { useState } from "react";
import { Button, message, Upload } from "antd";
import { UploadOutlined, DownloadOutlined } from "@ant-design/icons";
import {
  useGetFileInfo,
  useRequestFileUrl,
  useUploadFile,
} from "@/services/attachment";

export default function AttachmentDemo() {
  const [fileId, setFileId] = useState<string>();
  const { mutateAsync: uploadFile } = useUploadFile();
  const { mutateAsync: requestFile } = useRequestFileUrl();
  const { data: fileInfo } = useGetFileInfo(fileId);

  const handleUpload = async (file) => {
    const resp = await uploadFile(file);
    if (resp?.code !== 200) return;
    message.success("上传成功");
    setFileId(resp.data.id);
    return false;
  };

  const handleDownload = async () => {
    if (!fileId) return;
    const res = await requestFile(fileId);
    window.open(res.data.url);
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>附件功能演示</h2>

      <div style={{ marginBottom: 16 }}>
        <Upload beforeUpload={handleUpload} showUploadList={false}>
          <Button icon={<UploadOutlined />}>上传文件</Button>
        </Upload>
      </div>

      {fileId && (
        <>
          <div style={{ marginBottom: 16 }}>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleDownload}
              style={{ marginRight: 8 }}
            >
              下载文件
            </Button>
          </div>

          {fileInfo && (
            <div>
              <h3>文件信息</h3>
              <pre>{JSON.stringify(fileInfo, null, 2)}</pre>
            </div>
          )}
        </>
      )}
    </div>
  );
}
