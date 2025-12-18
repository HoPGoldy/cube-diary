import { createLocalInstance } from "@/utils/localstorage";

export const prefix = "$cube-note-";

/** 请求 token */
export const localAccessToken = createLocalInstance(prefix + "access-token");
