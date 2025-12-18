import {
  useQueryArticleFavorite,
  useQueryArticleLink,
  useQueryArticleTree,
} from "@/services/article";
import { UnorderedListOutlined, HeartOutlined } from "@ant-design/icons";
import { useGetAppConfig } from "@/services/app-config";
import { useState } from "react";
import { useCurrentArticleId } from "@/hooks/use-current-article-id";

export enum TabTypes {
  Sub = "sub",
  Favorite = "favorite",
}

export const tabOptions = [
  {
    label: "下属",
    sidebarLabel: "下属笔记",
    value: TabTypes.Sub,
    icon: <UnorderedListOutlined />,
  },
  {
    label: "收藏",
    sidebarLabel: "我的收藏",
    value: TabTypes.Favorite,
    icon: <HeartOutlined />,
  },
];

/** 空列表占位符样式 */
export const EMPTY_CLASSNAME = "text-gray-500 py-4 cursor-default text-center";

export const useMenu = () => {
  const [currentTab, setCurrentTab] = useState<TabTypes>(TabTypes.Sub);
  const { appConfig } = useGetAppConfig();
  const currentRootArticleId = appConfig.ROOT_ARTICLE_ID;
  const currentArticleId = useCurrentArticleId();

  // 获取左下角菜单树
  const { articleTree } = useQueryArticleTree(currentRootArticleId);
  // 获取当前文章的子级、父级文章
  const {
    parentArticleIds,
    parentArticleTitle,
    childrenArticles,
    isLoading: linkLoading,
  } = useQueryArticleLink(
    currentArticleId,
    !!(currentArticleId && currentTab === TabTypes.Sub),
  );
  // 获取收藏文章
  const { articleFavorite, isLoading: favoriteLoading } =
    useQueryArticleFavorite(
      !!(currentArticleId && currentTab === TabTypes.Favorite),
    );

  return {
    currentTab,
    setCurrentTab,
    currentRootArticleId,
    parentArticleIds,
    parentArticleTitle,
    articleTree,
    childrenArticles,
    linkLoading,
    articleFavorite,
    favoriteLoading,
  };
};
