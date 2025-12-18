import { ErrorBadRequest } from "@/types/error";

export class ErrorNoFile extends ErrorBadRequest {
  constructor() {
    super("请上传文件");
    this.code = 40005;
  }
}

export class ErrorWrongSignature extends ErrorBadRequest {
  constructor() {
    super("无效的请求");
    this.code = 40006;
  }
}

export class ErrorFileNotFound extends ErrorBadRequest {
  constructor() {
    super("文件不存在");
    this.code = 40007;
  }
}
