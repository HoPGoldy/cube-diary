import { FC } from "react";
import { ArticleContent } from "./article";
import { useCurrentArticleId } from "@/hooks/use-current-article-id";

const Article: FC = () => {
  const currentArticleId = useCurrentArticleId();

  return (
    <ArticleContent
      // 确保老文章不会污染新文章的状态
      key={currentArticleId}
      currentArticleId={currentArticleId!}
    />
  );
};

export default Article;
