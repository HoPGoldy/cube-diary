import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Breadcrumb } from "antd";
import { useQueryArticleLink, useQueryArticleTree } from "@/services/article";
import { BreadcrumbItemType } from "antd/es/breadcrumb/Breadcrumb";
import { useGetAppConfig } from "@/services/app-config";
import { useCurrentArticleId } from "./use-current-article-id";
import { SchemaArticleTreeNodeType } from "@shared-types/article";

/**
 * 面包屑导航
 */
export const useBreadcrumb = () => {
  const { appConfig } = useGetAppConfig();
  /** 根节点 id */
  const rootArticleId = appConfig.ROOT_ARTICLE_ID;
  /** 当前文章 id */
  const currentArticleId = useCurrentArticleId();
  // 获取左下角菜单树
  const { articleTree } = useQueryArticleTree(rootArticleId);
  /** 当前查看的文章祖先节点 */
  const { parentArticleIds } = useQueryArticleLink(currentArticleId);

  /** 当前面包屑配置项 */
  const breadcrumbConfig = useMemo(() => {
    if (!articleTree || !currentArticleId) return [];

    const pathNodes: SchemaArticleTreeNodeType[] = [];
    const idPath = [...(parentArticleIds || []), currentArticleId];

    idPath.reduce((prev, cur) => {
      const item = prev.find((i) => i.id === cur);
      if (!item) return [];
      pathNodes.push(item);
      return item.children || [];
    }, articleTree);

    const config: BreadcrumbItemType[] = pathNodes.map((i) => ({
      title: (
        <div className="truncate w-fit max-w-[8rem]" title={i.title}>
          <Link to={`/article/${i.id}`}>{i.title}</Link>
        </div>
      ),
    }));

    return config;
  }, [parentArticleIds, articleTree, currentArticleId]);

  /** 渲染桌面端面包屑 */
  const renderBreadcrumb = () => {
    return (
      <Breadcrumb
        items={breadcrumbConfig}
        className="overflow-y-hidden overflow-x-auto noscrollbar"
        separator=">"
      />
    );
  };

  return { renderBreadcrumb };
};
