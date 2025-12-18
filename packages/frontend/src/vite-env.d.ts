/// <reference types="vite/client" />

declare module "*.css";
declare module "*.less";
declare module "*.sass";
declare module "*.svg";
declare module "*.svg?react";
declare module "*.webp";
declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.gif";
declare module "*.bmp";
declare module "*.tiff";

declare const APP_CONFIG: {
  /** 前端路由前缀 */
  PATH_BASENAME: string;
};
