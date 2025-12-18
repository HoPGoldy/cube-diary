/**
 * 创建本地字段访问器
 *
 * @param key 要储存字段的键
 * @param place 要存到那里 localstorage 或者 sesstionstorage
 */
export const createLocalInstance = (
  key: string,
  defaultValue?: string,
  place: "local" | "session" = "local",
) => {
  const storage = place === "local" ? localStorage : sessionStorage;

  return {
    /** 获取 localstorage 中储存的值 */
    get: () => {
      return storage.getItem(key) || defaultValue;
    },
    /**
     * 设置 localstorage 中储存的值
     * 为空时将删除该 key
     */
    set: (value?: string) => {
      if (!value) storage.removeItem(key);
      else storage.setItem(key, value);
    },
  };
};
