import { FC, useMemo } from "react";
import { FileIconIcon, FileIconProps } from "./types";

import IconPdf from "@/assets/file/pdf.svg?react";
import IconWord from "@/assets/file/word.svg?react";
import IconExcel from "@/assets/file/excel.svg?react";
import IconPpt from "@/assets/file/ppt.svg?react";
import IconRar from "@/assets/file/rar.svg?react";
import IconUnknow from "@/assets/file/unknow.svg?react";
import IconFolder from "@/assets/file/folder.svg?react";
import IconWeb from "@/assets/file/web.svg?react";
import IconPng from "@/assets/file/png.svg?react";
import IconTxt from "@/assets/file/txt.svg?react";
import IconVideo from "@/assets/file/video.svg?react";
import IconMusic from "@/assets/file/music.svg?react";
import IconMarkdown from "@/assets/file/markdown.svg?react";
import IconJson from "@/assets/file/json.svg?react";
import IconXml from "@/assets/file/xml.svg?react";
import IconXMind from "@/assets/file/xmind.svg?react";

export const FileIcon: FC<FileIconProps> = (props) => {
  const suffix = useMemo(() => {
    if (!props.name) {
      return "";
    }
    return props.name?.split(".")?.pop()?.toLowerCase();
  }, [props.name]);

  if (props.isFolder) {
    return <IconFolder />;
  }

  const IconMap: FileIconIcon = {
    // 文档类型
    ["pdf"]: IconPdf,
    ["doc"]: IconWord,
    ["docx"]: IconWord,
    ["odt"]: IconWord,
    ["rtf"]: IconWord,

    // 表格类型
    ["xlsx"]: IconExcel,
    ["xls"]: IconExcel,
    ["csv"]: IconExcel,
    ["ods"]: IconExcel,

    // 演示文稿类型
    ["ppt"]: IconPpt,
    ["pptx"]: IconPpt,
    ["odp"]: IconPpt,

    // 压缩文件类型
    ["zip"]: IconRar,
    ["rar"]: IconRar,
    ["7z"]: IconRar,
    ["tar"]: IconRar,
    ["gz"]: IconRar,

    // 图片类型
    ["png"]: IconPng,
    ["jpeg"]: IconPng,
    ["jpg"]: IconPng,
    ["gif"]: IconPng,
    ["bmp"]: IconPng,
    ["svg"]: IconPng,
    ["webp"]: IconPng,

    // 视频类型
    ["mp4"]: IconVideo,
    ["webm"]: IconVideo,
    ["avi"]: IconVideo,

    // 音频类型
    ["mp3"]: IconMusic,
    ["wav"]: IconMusic,
    ["ogg"]: IconMusic,
    ["flac"]: IconMusic,

    // 文本文件类型
    ["txt"]: IconTxt,
    ["md"]: IconMarkdown, // Markdown
    ["log"]: IconTxt,
    ["json"]: IconJson,
    ["xml"]: IconXml,
    ["xmind"]: IconXMind,

    // 其他类型
    ["web"]: IconWeb,
  };

  const IcomComp = IconMap[suffix as keyof FileIconIcon] || IconUnknow;
  return <IcomComp className="flex-shrink-0" />;
};
