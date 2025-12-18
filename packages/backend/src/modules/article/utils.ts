import { SchemaArticleItemType } from "@/types/article";
import { getParentIdByPath } from "@/utils/tree";
import { Article } from "@db/client";

export interface ArticleTreeData {
  id: string;
  title: string;
  parentPath: string | null;
  color: string | null;
}

export interface ArticleTreeNode extends ArticleTreeData {
  children?: ArticleTreeNode[];
}

/**
 * 构建文章树形结构
 */
export const buildArticleTree = (
  articles: ArticleTreeData[],
): ArticleTreeNode[] => {
  const map = new Map<string, ArticleTreeNode>();
  const roots: ArticleTreeNode[] = [];

  // 第1步：创建所有节点
  for (const article of articles) {
    map.set(article.id, { ...article, children: [] });
  }

  // 第2步：建立父子关系
  for (const article of articles) {
    const node = map.get(article.id)!;
    const parentId = getParentIdByPath(article.parentPath);

    if (parentId) {
      const parent = map.get(parentId);
      if (parent) {
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(node);
      }
    } else {
      // 没有父级则是根节点
      roots.push(node);
    }
  }

  return roots;
};
