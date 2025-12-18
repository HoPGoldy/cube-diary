import { FC, useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ActionButton,
  PageContent,
  PageAction,
  ActionIcon,
} from "@/layouts/page-with-action";
import {
  ArticleUpdateData,
  useQueryArticleContent,
  useQueryArticleLink,
  useUpdateArticle,
} from "@/services/article";
import { messageWarning } from "@/utils/message";
import TagArea from "./area-tag";
import { blurOnEnter } from "@/utils/input";
import {
  SettingOutlined,
  SearchOutlined,
  MenuOutlined,
  FormOutlined,
  LoadingOutlined,
  SaveOutlined,
  UnorderedListOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import s from "./styles.module.css";
import { SidebarMobile } from "@/layouts/sidebar/mobile";
import { Button, Card, Drawer, Flex } from "antd";
import { MobileSetting } from "@/pages/user-setting";
import { PageLoading } from "@/components/page-loading";
import { Editor, MarkdownPreview } from "@/components/markdown-editor";
import { useArticleConfigAction } from "../article-config/use-detail-action";
import { DesktopArea, useIsMobile } from "@/layouts/responsive";
import { ColorDot } from "@/components/color-picker/color-dot";
import { PreviewType } from "@uiw/react-md-editor";
import { useAutoSave } from "./hooks/use-auto-save";
import { AreaMobileActionBar } from "./area-mobile-action-bar";
import { useArticleDetailAction } from "./hooks/use-detail-action";
import { EditorRef } from "@/components/markdown-editor/editor";
import { useCreateArticle } from "@/hooks/use-create-article";
import { SchemaArticleMenuType } from "@shared-types/article";

interface ArticleProps {
  currentArticleId: string;
}

export const ArticleContent: FC<ArticleProps> = ({ currentArticleId }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  /** 是否展示设置 */
  const [showSetting, setShowSetting] = useState(false);
  /** 获取详情 */
  const { data: articleResp, isLoading: isLoadingArticle } =
    useQueryArticleContent(currentArticleId);
  // 获取当前文章的子级、父级文章
  const { data: articleLink, isLoading: linkLoading } = useQueryArticleLink(
    currentArticleId,
    !!articleResp?.data?.listSubarticle,
  );
  const isMobile = useIsMobile();
  /** 保存详情 */
  const { mutateAsync: updateArticle, isPending: updatingArticle } =
    useUpdateArticle();
  /** 标题是否被修改 */
  const isTitleModified = useRef(false);
  /** 标题输入框 */
  const titleInputRef = useRef<HTMLInputElement>(null);
  /** 正在编辑的标题内容 */
  const [title, setTitle] = useState("");
  // 正在编辑的文本内容
  const [content, setContent] = useState("");
  const editorRef = useRef<EditorRef>();

  const { createArticle } = useCreateArticle();
  const detailActions = useArticleDetailAction();

  /** 是否展开导航抽屉 */
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);

  /** 点击保存按钮必定会触发保存，无论内容是否被修改 */
  const onClickSaveBtn = async () => {
    await saveEdit({ title, content });
    autoSave.setAutoSaveTip("");
    detailActions.endEdit();
  };

  /** 只有在内容变化时，点击退出按钮才会自动保存 */
  const onClickExitBtn = async () => {
    autoSave.setAutoSaveTip("");
    if (autoSave.isContentModified.current) onClickSaveBtn();
    autoSave.isContentModified.current = false;
    detailActions.endEdit();
  };

  const articleConfigActions = useArticleConfigAction();

  const autoSave = useAutoSave({
    content,
    articleId: currentArticleId,
  });

  const onContentChange = (newContent: string) => {
    setContent(newContent);
    autoSave.run();
  };

  // 新增笔记时，自动聚焦标题输入框
  useEffect(() => {
    if (searchParams.get("focus") !== "title") return;
    setTimeout(() => {
      titleInputRef.current?.select();
      searchParams.delete("focus");
      setSearchParams(searchParams, { replace: true });
    }, 100);
  }, [searchParams.get("focus")]);

  useEffect(() => {
    if (!articleResp?.data) return;

    setTitle(articleResp.data.title);
    setContent(articleResp.data.content);
  }, [articleResp]);

  const saveEdit = async (data: Partial<ArticleUpdateData>) => {
    if (data.title === "") {
      messageWarning("标题不能为空");
      return;
    }

    const resp = await updateArticle({ ...data, id: currentArticleId });
    if (!resp.success) return;

    autoSave.setAutoSaveTip("");
  };

  /** 渲染底部的子笔记项目 */
  const renderSubArticleItem = (item: SchemaArticleMenuType) => {
    return (
      <Link to={`/article/${item.id}`} key={item.id}>
        <Card
          size="small"
          className="hover:ring-2 ring-gray-300 dark:ring-neutral-500 transition-all cursor-pointer"
        >
          <Flex justify="space-between" align="center" gap={8}>
            <span className="font-bold truncate">{item.title}</span>
            <ColorDot color={item.color} />
          </Flex>
        </Card>
      </Link>
    );
  };

  /** 渲染底部的子笔记列表 */
  const renderSubArticleList = () => {
    if (!articleResp?.data?.listSubarticle || detailActions.isEdit) return null;
    if (linkLoading) return <PageLoading tip="信息加载中..." />;
    if (!articleLink?.data?.childrenArticles?.length) return null;

    return (
      <>
        <div className="w-full xl:w-[60%] mx-auto bg-neutral-100 dark:bg-neutral-800 p-3 rounded-lg box-border mb-2">
          <div className="mb-2">子笔记列表：</div>
          <div className="grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {articleLink?.data?.childrenArticles.map(renderSubArticleItem)}
          </div>
        </div>
        {/* 留出一些底部空间 */}
        <div className="w-full flex-shrink-0 h-10"></div>
      </>
    );
  };

  const SaveIcon = updatingArticle ? LoadingOutlined : SaveOutlined;

  const renderContent = () => {
    if (isLoadingArticle) return <PageLoading tip="信息加载中..." />;

    return (
      <div className="box-border p-4 md:w-full h-full flex flex-col flex-nowrap">
        <div className="flex justify-between items-center md:items-start">
          <input
            ref={titleInputRef}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              isTitleModified.current = true;
            }}
            onKeyUp={blurOnEnter}
            onBlur={() => {
              if (isTitleModified.current) saveEdit({ title });
              isTitleModified.current = false;
            }}
            placeholder="请输入笔记名"
            className="font-bold border-0 text-3xl py-2 mr-2 w-full dark:text-white"
          />
          <Flex gap={8} align="center" className="flex-shrink-0">
            <DesktopArea>
              <div className="flex-shrink-0">{autoSave.autoSaveTip}</div>
            </DesktopArea>
            <Button
              icon={<UnorderedListOutlined />}
              type={isMobile ? "text" : "default"}
              onClick={() => articleConfigActions.onOpen(currentArticleId)}
            >
              {isMobile ? "" : "配置"}
            </Button>
            {!detailActions.isEdit && (
              <Button
                icon={<PlusOutlined />}
                type={isMobile ? "text" : "default"}
                onClick={() => createArticle()}
              >
                {isMobile ? "" : "新增子笔记"}
              </Button>
            )}
            <DesktopArea>
              {detailActions.isEdit ? (
                <Button
                  type="primary"
                  onClick={onClickSaveBtn}
                  icon={<SaveIcon />}
                >
                  保存
                </Button>
              ) : (
                <Button
                  type="primary"
                  onClick={detailActions.startEdit}
                  icon={<FormOutlined />}
                >
                  编辑
                </Button>
              )}
            </DesktopArea>
          </Flex>
        </div>

        <TagArea
          articleId={currentArticleId}
          value={articleResp?.data?.tagIds || []}
          disabled={!detailActions.isEdit}
        />

        {detailActions.isEdit ? (
          <div className={[s.editorArea, s.mdArea].join(" ")}>
            <Editor
              ref={editorRef}
              value={content}
              preview={(isMobile ? "edit" : "live") as PreviewType}
              onChange={onContentChange}
            />
          </div>
        ) : (
          <div className={`md:w-[100%] mt-3 ${s.mdArea}`}>
            <MarkdownPreview source={content} />
          </div>
        )}

        {renderSubArticleList()}
      </div>
    );
  };

  const renderActionBar = () => {
    if (detailActions.isEdit)
      return (
        <AreaMobileActionBar
          updatingArticle={updatingArticle}
          autoSaveTip={autoSave.autoSaveTip}
          onUploadFile={(files) => {
            return editorRef.current?.insertFile(files);
          }}
          onClickSaveBtn={onClickSaveBtn}
          onClickExitBtn={onClickExitBtn}
        />
      );

    return (
      <>
        <ActionIcon
          icon={<SettingOutlined />}
          onClick={() => setShowSetting(true)}
        />
        <SidebarMobile
          currentArticleId={currentArticleId}
          open={isMenuDrawerOpen}
          onClose={() => setIsMenuDrawerOpen(false)}
        />
        <Drawer
          open={showSetting}
          onClose={() => setShowSetting(false)}
          closable={false}
          placement="left"
          className={s.settingDrawer}
          width="100%"
        >
          <MobileSetting
            visible={showSetting}
            onVisibleChange={setShowSetting}
          />
        </Drawer>
        <Link to="/search">
          <ActionIcon icon={<SearchOutlined />} />
        </Link>
        <ActionIcon
          icon={<MenuOutlined />}
          onClick={() => setIsMenuDrawerOpen(true)}
        />
        <ActionButton onClick={detailActions.startEdit}>编辑</ActionButton>
      </>
    );
  };

  return (
    <>
      <PageContent>{renderContent()}</PageContent>
      <PageAction>{renderActionBar()}</PageAction>
      {autoSave.contextHolder}
    </>
  );
};
