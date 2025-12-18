import { Navigate } from "react-router-dom";
import { useGetAppConfig } from "@/services/app-config";
import { PageLoading } from "@/components/page-loading";

const JumpToDefaultDataEntry = () => {
  const { appConfig } = useGetAppConfig();

  if (!appConfig.ROOT_ARTICLE_ID) {
    return <PageLoading />;
  }

  return <Navigate to={`/article/${appConfig.ROOT_ARTICLE_ID}`} replace />;
};

export default JumpToDefaultDataEntry;
