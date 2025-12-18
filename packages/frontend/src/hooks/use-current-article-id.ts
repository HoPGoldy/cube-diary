import { useParams } from "react-router-dom";

export const useCurrentArticleId = () => {
  const params = useParams();
  return params.articleId;
};
