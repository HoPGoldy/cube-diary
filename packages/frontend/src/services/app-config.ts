import { queryClient, requestGet, requestPost } from "./base";
import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  SchemaAppConfigType,
  SchemaAppVersionResponseType,
} from "@shared-types/app-config";

export const useGetAppConfig = () => {
  const result = useQuery({
    queryKey: ["app-config/all"],
    queryFn: () => requestPost<SchemaAppConfigType>("config"),
  });

  return {
    ...result,
    appConfig: (result.data?.data || {}) as SchemaAppConfigType,
  };
};

export const useUpdateAppConfig = () => {
  return useMutation({
    mutationFn: (data: SchemaAppConfigType) =>
      requestPost("config/update", data),
    onSuccess: () => {
      // 作废所有缓存重新查询
      queryClient.invalidateQueries();
    },
  });
};

export const useAppVersion = () => {
  const result = useQuery({
    queryKey: ["app-config/version"],
    queryFn: () => requestGet<SchemaAppVersionResponseType>("config/version"),
  });

  return {
    ...result,
    appVersion: result.data?.data,
  };
};
