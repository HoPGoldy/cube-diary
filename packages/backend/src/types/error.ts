export class ErrorHttp extends Error {
  public statusCode: number;
  public code: number;
  public headers?: Record<string, string>;

  constructor(message: string) {
    super(message);
    this.name = "HttpError";
    this.statusCode = 500;
    this.code = 50000;
  }
}

export class ErrorNotFound extends ErrorHttp {
  constructor(message = "Not Found") {
    super(message);
    this.statusCode = 404;
    this.code = 40400;
  }
}

export class ErrorBadRequest extends ErrorHttp {
  constructor(message = "Bad Request") {
    super(message);
    this.statusCode = 400;
    this.code = 40000;
  }
}

export class ErrorUnauthorized extends ErrorHttp {
  constructor(message = "Unauthorized") {
    super(message);
    this.statusCode = 401;
    this.code = 40100;
  }
}

export class ErrorForbidden extends ErrorHttp {
  constructor(message = "Forbidden") {
    super(message);
    this.statusCode = 403;
    this.code = 40300;
  }
}

export class ErrorInternalServer extends ErrorHttp {
  constructor(message = "Internal Server Error") {
    super(message);
    this.statusCode = 500;
    this.code = 50000;
  }
}
