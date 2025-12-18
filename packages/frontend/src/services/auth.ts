import { useMutation } from "@tanstack/react-query";
import { requestPost } from "./base";
import type {
  SchemaAuthLoginBodyType,
  SchemaAuthLoginResponseType,
  SchemaAuthRenewResponseType,
} from "@shared-types/auth";

/** 登录 */
export const useLogin = () => {
  return useMutation({
    mutationFn: (data: SchemaAuthLoginBodyType) => {
      return requestPost<SchemaAuthLoginResponseType>("auth/login", data);
    },
  });
};

/** 刷新令牌 */
export const useRefreshToken = () => {
  return useMutation({
    mutationFn: () => {
      return requestPost<SchemaAuthRenewResponseType>("auth/renew");
    },
  });
};
