import { createLocalInstance } from "@/utils/localstorage";

export const prefix = "$cube-diary-";

/** 请求 token */
export const localAccessToken = createLocalInstance(prefix + "access-token");
