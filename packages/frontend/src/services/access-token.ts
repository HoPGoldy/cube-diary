import { requestDelete, requestGet, requestPost } from "./base";
import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  SchemaAccessTokenCreateResponseType,
  SchemaAccessTokenListType,
} from "@shared-types/access-token";

export const useAccessTokenList = () => {
  return useQuery({
    queryKey: ["access-tokens"],
    queryFn: () => requestGet<SchemaAccessTokenListType>("access-tokens"),
  });
};

export const useCreateAccessToken = () => {
  return useMutation({
    mutationFn: (data: { name: string; scopes: string[] }) =>
      requestPost<SchemaAccessTokenCreateResponseType>("access-tokens", data),
  });
};

export const useDeleteAccessToken = () => {
  return useMutation({
    mutationFn: (id: string) => requestDelete(`access-tokens/${id}`),
  });
};
