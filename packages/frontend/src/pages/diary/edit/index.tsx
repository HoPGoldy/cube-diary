import { FC, useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageContent, PageAction } from "@/layouts/page-with-action";
import { Editor } from "@/components/markdown-editor";
import {
  useQueryDiaryDetail,
  useUpdateDiary,
  autoSaveContent,
} from "@/services/diary";
import { getLabelByDate } from "../constants";
import { Button, Space, message } from "antd";
import { LeftOutlined, SaveOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import debounce from "lodash/debounce";
import styles from "./styles.module.css";

const DiaryEdit: FC = () => {
  const params = useParams<{ date: string }>();
  const navigate = useNavigate();
  const diaryDate = dayjs(params.date, "YYYYMMDD")
    .startOf("day")
    .utc()
    .valueOf();
  console.log(
    "🚀 ~ DiaryEdit ~ diaryDate:",
    dayjs(diaryDate).format(),
    dayjs(diaryDate).utc().format(),
  );
  const diaryTitle = getLabelByDate(diaryDate);

  /** 获取详情 */
  const { data: diaryResp, isFetching: isLoadingDiary } =
    useQueryDiaryDetail(diaryDate);
  /** 保存详情 */
  const { mutateAsync: updateDiary, isPending: diaryUpdating } =
    useUpdateDiary();

  /** 编辑器内容 */
  const [content, setContent] = useState("");
  /** 内容是否被修改 */
  const isContentModified = useRef(false);
  /** 自动保存提示文本 */
  const [saveBtnText, setSaveBtnText] = useState("");

  // 自动保存
  const autoSave = useCallback(
    debounce(async (date: number, newContent: string) => {
      if (!isContentModified.current) return;

      try {
        await autoSaveContent(date, newContent);
        setSaveBtnText(`自动保存于 ${dayjs().format("HH:mm")}`);
      } catch {
        console.error("自动保存失败");
      }
    }, 1000),
    [],
  );

  // 编辑器内容变化
  const onContentChange = (newContent: string) => {
    setContent(newContent);
    isContentModified.current = true;
    autoSave(diaryDate, newContent);
  };

  /** 点击返回按钮 */
  const onClickBack = () => {
    navigate(-1);
  };

  /** 点击保存按钮 */
  const onClickSaveBtn = async () => {
    try {
      await updateDiary({ date: diaryDate, content });
      message.success("保存成功");
      onClickBack();
    } catch {
      message.error("保存失败");
    }
  };

  useEffect(() => {
    if (diaryResp?.data) {
      setContent(diaryResp.data.content);
      isContentModified.current = false;
    }
  }, [diaryResp]);

  const renderContent = () => {
    if (isLoadingDiary) {
      return <div className="p-4 text-center">加载中...</div>;
    }

    return (
      <div className="box-border p-4 h-full flex flex-col">
        <div className="font-black text-xl flex flex-row justify-between items-center mb-4">
          <div>{diaryTitle}</div>
          <div className="hidden md:flex">
            <Space>
              {saveBtnText && (
                <span className="text-xs font-normal text-gray-500">
                  {saveBtnText}
                </span>
              )}
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={onClickSaveBtn}
                loading={diaryUpdating}
              >
                保存
              </Button>
            </Space>
          </div>
        </div>

        <div className={`flex-1 ${styles.editorArea}`}>
          <Editor value={content} onChange={onContentChange} />
        </div>
      </div>
    );
  };

  return (
    <>
      <PageContent>{renderContent()}</PageContent>

      <PageAction>
        <Button
          size="large"
          icon={<LeftOutlined />}
          onClick={onClickBack}
          className="mr-2"
        >
          返回
        </Button>
        <Button
          type="primary"
          block
          size="large"
          icon={<SaveOutlined />}
          onClick={onClickSaveBtn}
          loading={diaryUpdating}
        >
          保存
        </Button>
      </PageAction>
    </>
  );
};

export default DiaryEdit;
