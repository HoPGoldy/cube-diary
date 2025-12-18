/** 将多个 url 路径合并成一个，避免中间出现两个斜杠的情况 */
export const mergeUrl = (...path: string[]) => {
  return path.reduce((pre = "", cur = "") => {
    const endSlash = pre.endsWith("/");
    const startSlash = cur.startsWith("/");

    if (endSlash && startSlash) return pre + cur.substring(1);
    if (!endSlash && !startSlash) return pre + "/" + cur;
    return pre + cur;
  });
};

/** 在 url 前追加前端静态资源目录的路径前缀 */
export const withFrontend = (...urls: string[]) => {
  const prefix = mergeUrl(location.origin, APP_CONFIG.PATH_BASENAME);

  if (!urls || !urls.length) return prefix;
  if (urls[0].startsWith("http")) return urls[0];
  return mergeUrl(prefix, ...urls);
};
