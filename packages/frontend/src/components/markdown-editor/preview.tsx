import MDEditor from "@uiw/react-md-editor";
import { FC, MouseEventHandler, useState } from "react";
import { CustomA } from "./components/custom-a";
import { CustomImg } from "./components/custom-img";
import { Image } from "antd";

export const MarkdownPreview: FC<Parameters<typeof MDEditor.Markdown>[0]> = (
  props,
) => {
  const { components, ...restProps } = props;
  const mergedComponents = {
    img: CustomImg,
    a: CustomA,
    ...components,
  };

  const [visibleImgSrc, setVisibleImgSrc] = useState("");

  const onClickDetail: MouseEventHandler<HTMLDivElement> = (e) => {
    const target = e.target as HTMLImageElement;
    if (target?.tagName === "IMG") {
      if (target.src.startsWith(location.origin)) {
        setVisibleImgSrc(target.src + "&type=original");
        return;
      }

      setVisibleImgSrc(target.src);
    }
  };

  return (
    <>
      <div className="w-full h-full" onClick={onClickDetail}>
        <MDEditor.Markdown {...restProps} components={mergedComponents} />
      </div>
      <Image
        style={{ display: "none" }}
        preview={{
          visible: !!visibleImgSrc,
          src: visibleImgSrc,
          onVisibleChange: () => setVisibleImgSrc(""),
        }}
      />
    </>
  );
};
