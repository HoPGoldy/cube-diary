import { ComponentType, lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import Loading from "./layouts/loading";
import { LoginAuth } from "./layouts/login-auth";
import { AppContainer } from "./layouts/app-container";
import { Error403 } from "./pages/e403";
import Login from "./pages/login";
import Entry from "./pages/entry";
import Article from "./pages/article";
import Search from "./pages/search/search";
import AttachmentDemo from "./pages/attachment-demo";
import MarkdownEditorDemo from "./pages/markdown-editor-demo";
import { TagDetailModal } from "./pages/tag-detail";
import { ArticleConfigModal } from "./pages/article-config";

const lazyLoad = (
  compLoader: () => Promise<{ default: ComponentType<any> }>,
) => {
  const Comp = lazy(compLoader);
  return (
    <Suspense fallback={<Loading />}>
      <Comp />
    </Suspense>
  );
};

export const routes = createBrowserRouter(
  [
    {
      path: "/",
      children: [
        { index: true, element: <Entry /> },
        // 笔记详情
        { path: "/article/:articleId", element: <Article /> },
        // 笔记搜索
        { path: "/search", element: <Search /> },
        // 标签管理
        {
          path: "/tags",
          element: lazyLoad(() => import("./pages/tag-manager")),
        },
      ],
      element: (
        <LoginAuth>
          <AppContainer />
          <TagDetailModal />
          <ArticleConfigModal />
        </LoginAuth>
      ),
    },
    // 登录
    {
      path: "/login",
      element: <Login />,
    },
    { path: "/e403", element: <Error403 /> },
    { path: "/file-demo", element: <AttachmentDemo /> },
    { path: "/markdown-editor-demo", element: <MarkdownEditorDemo /> },
  ],
  {
    basename: APP_CONFIG.PATH_BASENAME,
  },
);
