import { AppResponse } from "@/types/global";
import { logout, stateUserToken } from "@/store/user";
import { showGlobalMessage } from "../utils/message";
import axios from "axios";
import type { AxiosRequestConfig } from "axios";
import { QueryClient } from "@tanstack/react-query";
import { getDefaultStore } from "jotai";

/**
 * 是否为标准后端数据结构
 */
const isAppResponse = (data: unknown): data is AppResponse<unknown> => {
  return typeof data === "object" && data !== null && "code" in data;
};

export const axiosInstance = axios.create({ baseURL: "api/" });

axiosInstance.interceptors.request.use((config) => {
  const store = getDefaultStore();
  const token = store.get(stateUserToken);

  // 附加 jwt header
  if (token) config.headers.Authorization = `Bearer ${token}`;

  return config;
});

axiosInstance.interceptors.response.use(
  (resp) => {
    if (!isAppResponse(resp.data)) return resp;
    const { code, message: msg } = resp.data;

    if (code !== 200 && msg) {
      showGlobalMessage("warning", msg);
    }

    return resp;
  },
  (resp) => {
    if (!resp.response) {
      showGlobalMessage("error", "网络错误，请检查网络连接是否正常");
      return Promise.reject(resp);
    }

    const { status, data } = resp.response;

    if (status === 413) {
      showGlobalMessage("error", "上传失败，文件大小超出上限");
      return Promise.reject(resp);
    }

    if (status === 403) {
      window.location.href = "/e403";
      return Promise.reject(resp);
    }

    if (status === 401) {
      logout();
    }

    if (data?.message) {
      showGlobalMessage("warning", data.message);
    }

    return Promise.reject(resp);
  },
);

export const requestGet = async <T = any>(
  url: string,
  config?: AxiosRequestConfig,
) => {
  const resp = await axiosInstance.get<AppResponse<T>>(url, config);
  return resp.data;
};

export const requestPost = async <T = any, D = any>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig<D>,
) => {
  const resp = await axiosInstance.post<AppResponse<T>>(url, data, config);
  return resp.data;
};

export const queryClient = new QueryClient();
