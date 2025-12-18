import { FC, useEffect, useState } from "react";
import { Skeleton } from "antd";
import { useRequestFileUrl } from "@/services/attachment";
import { FILE_PREFIX } from "../constants";
import { mergeUrl } from "@/utils/path";

export const CustomImg: FC<React.ImgHTMLAttributes<HTMLImageElement>> = (
  props,
) => {
  const { src, ...restProps } = props;
  const [realHref, setRealHref] = useState<string | null>(null);
  const [isAppFile, setIsAppFile] = useState(false);
  const { mutateAsync: requestFileUrl } = useRequestFileUrl();

  useEffect(() => {
    if (!src) {
      setIsAppFile(false);
      return;
    }

    if (!src.startsWith(FILE_PREFIX)) {
      setIsAppFile(false);
    }

    const fetchFileUrl = async () => {
      if (!src) return;

      const fileId = src.replace(FILE_PREFIX, "");
      const response = await requestFileUrl(fileId);

      if (response && response.success) {
        setRealHref(mergeUrl(APP_CONFIG.PATH_BASENAME, response.data.url));
      } else {
        setRealHref(null);
      }
    };

    fetchFileUrl();
    setIsAppFile(true);
  }, [src]);

  const className = `${props.className || ""} !block mx-auto cursor-pointer`;

  if (!isAppFile) {
    return <img {...props} className={className} />;
  }

  if (!realHref) {
    return <Skeleton.Avatar active shape="square" size="large" />;
  }

  return <img {...restProps} src={realHref} className={className} />;
};
