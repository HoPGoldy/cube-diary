import type { ReactNode } from "react";

export type FileIconIcon = {
  pdf?: ReactNode;
  doc?: ReactNode;
  docx?: ReactNode;
  odt?: ReactNode;
  rtf?: ReactNode;

  xlsx?: ReactNode;
  xls?: ReactNode;
  csv?: ReactNode;
  ods?: ReactNode;

  ppt?: ReactNode;
  pptx?: ReactNode;
  odp?: ReactNode;

  zip?: ReactNode;
  rar?: ReactNode;
  "7z"?: ReactNode;
  tar?: ReactNode;
  gz?: ReactNode;

  png?: ReactNode;
  jpeg?: ReactNode;
  jpg?: ReactNode;
  gif?: ReactNode;
  bmp?: ReactNode;
  svg?: ReactNode;
  webp?: ReactNode;

  mp4?: ReactNode;
  webm?: ReactNode;
  avi?: ReactNode;

  mp3?: ReactNode;
  wav?: ReactNode;
  ogg?: ReactNode;
  flac?: ReactNode;

  txt?: ReactNode;
  md?: ReactNode;
  log?: ReactNode;
  json?: ReactNode;
  xml?: ReactNode;
  xmind?: ReactNode;

  web?: ReactNode;
  qa?: ReactNode;
  knowledge?: ReactNode;
  tags?: ReactNode;
  files?: ReactNode;
} & {
  [key: string]: ReactNode;
};

export interface FileIconProps {
  /**
   * 文件名称、后缀名
   */
  name?: string;
  /**
   * 是否为文件夹
   * @default false
   */
  isFolder?: boolean;
}
