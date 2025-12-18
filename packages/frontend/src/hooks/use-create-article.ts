import { useAddArticle } from "@/services/article";
import { useCurrentArticleId } from "./use-current-article-id";
import { useNavigate } from "react-router-dom";

export const useCreateArticle = () => {
  const currentArticleId = useCurrentArticleId();
  const navigate = useNavigate();
  const { mutateAsync: addArticle } = useAddArticle();

  const createArticle = async () => {
    if (!currentArticleId) {
      console.error("当前文章不存在，无法创建子文章");
      return;
    }

    const title = "新笔记";
    const resp = await addArticle({
      title,
      content: "",
      parentId: currentArticleId,
    });
    if (!resp.success) return;

    navigate(`/article/${resp.data?.id}?mode=edit&focus=title`);
  };

  return { createArticle };
};
