import { requestDelete, requestGet, requestPost } from "./base";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ACCESS_TOKEN_SCOPES,
  ACCESS_TOKEN_SCOPE_LABELS,
  DEFAULT_ACCESS_TOKEN_SCOPES,
} from "@shared-types/access-token";
import type {
  AccessTokenScope,
  SchemaAccessTokenCreateResponseType,
  SchemaAccessTokenListType,
} from "@shared-types/access-token";

export {
  ACCESS_TOKEN_SCOPES,
  ACCESS_TOKEN_SCOPE_LABELS,
  DEFAULT_ACCESS_TOKEN_SCOPES,
};
export type { AccessTokenScope };

export const useAccessTokenList = () => {
  return useQuery({
    queryKey: ["access-tokens"],
    queryFn: () => requestGet<SchemaAccessTokenListType>("access-tokens"),
  });
};

export const useCreateAccessToken = () => {
  return useMutation({
    mutationFn: (data: { name: string; scopes: AccessTokenScope[] }) =>
      requestPost<SchemaAccessTokenCreateResponseType>("access-tokens", data),
  });
};

export const useDeleteAccessToken = () => {
  return useMutation({
    mutationFn: (id: string) => requestDelete(`access-tokens/${id}`),
  });
};
