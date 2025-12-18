import { ErrorForbidden, ErrorUnauthorized } from "@/types/error";

export class ErrorAuthFailed extends ErrorUnauthorized {
  constructor() {
    super("用户名或密码错误");
    this.code = 40101;
  }
}

export class ErrorNeedLogin extends ErrorUnauthorized {
  constructor() {
    super("未授权访问");
    this.code = 40102;
  }
}

export class ErrorBanned extends ErrorForbidden {
  constructor() {
    super("该用户已被禁用");
    this.code = 40303;
  }
}
