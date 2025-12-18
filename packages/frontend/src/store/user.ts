import { atom, getDefaultStore } from "jotai";
import JWT from "@/utils/jwt";
import { localAccessToken } from "./lcoal";
import { SchemaAuthLoginResponseType } from "@shared-types/auth";

/**
 * 当前用户的登录 token
 */
export const stateUserToken = atom<string | null>(localAccessToken.get());

export const stateUserJwtData = atom((get) => {
  const token = get(stateUserToken);
  if (!token) return null;
  return new JWT(token).payload;
});

export const logout = () => {
  const store = getDefaultStore();

  store.set(stateUserToken, null);
  localAccessToken.set();
};

export const login = (payload: SchemaAuthLoginResponseType) => {
  const { token } = payload;
  const store = getDefaultStore();

  store.set(stateUserToken, token);
  localAccessToken.set(token);
};
