import { App, message as antdMessage } from "antd";
import { MessageInstance, NoticeType } from "antd/es/message/interface";

let messageInstance: MessageInstance = antdMessage;

export const useInitMessage = () => {
  const staticFunction = App.useApp();
  messageInstance = staticFunction.message;
};

export const message = (type: NoticeType, content: string, key?: string) => {
  return messageInstance.open({ type, content, key });
};

export const messageSuccess = (message: string) => {
  return messageInstance.success(message);
};

export const messageError = (message: string) => {
  return messageInstance.error(message);
};

export const messageWarning = (message: string) => {
  return messageInstance.warning(message);
};

export const messageInfo = (message: string) => {
  return messageInstance.info(message);
};

export const showGlobalMessage = (type: NoticeType, content: string) => {
  return message(type, content, "global");
};
