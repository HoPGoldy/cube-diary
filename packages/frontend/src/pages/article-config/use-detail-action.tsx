import { useSearchParams } from "react-router-dom";

export const DETAIL_ID_KEY = "article-config-id";

export const useArticleConfigAction = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const onOpen = (id: string) => {
    searchParams.set(DETAIL_ID_KEY, id);
    setSearchParams(searchParams, { replace: true });
  };

  return {
    onOpen,
  };
};
