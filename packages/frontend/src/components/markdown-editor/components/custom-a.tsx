import { FC, useEffect, useState } from "react";
import { useRequestFileUrl } from "@/services/attachment";
import { FILE_PREFIX } from "../constants";
import { mergeUrl } from "@/utils/path";

export const CustomA: FC<React.AnchorHTMLAttributes<HTMLAnchorElement>> = (
  props,
) => {
  const { href } = props;
  const [isAppFile, setIsAppFile] = useState(false);
  const { mutateAsync: requestFileUrl, isPending: isRequestingFileUrl } =
    useRequestFileUrl();

  useEffect(() => {
    if (!href) {
      setIsAppFile(false);
      return;
    }

    if (!href.startsWith(FILE_PREFIX)) {
      setIsAppFile(false);
      return;
    }

    setIsAppFile(true);
  }, [href]);

  const onOpenFileLink = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    const fileId = href.replace(FILE_PREFIX, "");
    const response = await requestFileUrl(fileId);
    if (!response || !response.success) {
      return;
    }

    const url = mergeUrl(APP_CONFIG.PATH_BASENAME, response.data.url);
    window.open(url, "_blank");
  };

  if (!isAppFile) {
    return <a {...props} />;
  }

  if (isRequestingFileUrl) {
    return <span className="text-gray-400">加载中...</span>;
  }

  return (
    <a
      {...props}
      onClick={onOpenFileLink}
      // 禁用右键 “在新标签页打开”，因为这样没法触发请求真实链接的逻辑
      onContextMenu={(e) => e.preventDefault()}
    />
  );
};
