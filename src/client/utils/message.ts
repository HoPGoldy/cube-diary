import { App, message as antdMessage } from 'antd';
import { MessageInstance, NoticeType } from 'antd/es/message/interface';

let messageInstance: MessageInstance = antdMessage;

export const useInitMessage = () => {
  const staticFunction = App.useApp();
  messageInstance = staticFunction.message;
};

export const message = (type: NoticeType, content: string) => {
  return messageInstance.open({ type, content });
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
