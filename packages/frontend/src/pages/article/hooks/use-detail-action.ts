import { useSearchParams } from "react-router-dom";

export const DETAIL_ID_KEY = "article-detail-id";

export const useArticleDetailAction = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  /** 进入编辑模式 */
  const startEdit = () => {
    searchParams.set("mode", "edit");
    setSearchParams(searchParams, { replace: true });
  };

  /** 退出编辑模式 */
  const endEdit = async () => {
    searchParams.delete("mode");
    setSearchParams(searchParams, { replace: true });
  };

  const isEdit = searchParams.get("mode") === "edit";

  return {
    startEdit,
    endEdit,
    isEdit,
  };
};
