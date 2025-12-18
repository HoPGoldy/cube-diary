import { decode } from "js-base64";

enum UserRole {
  ADMIN = "admin",
  USER = "user",
}

interface JwtPayload {
  username: string;
  email: string;
  role: UserRole;
}

export default class JWT<
  Header = {
    alg: "HS256";
    typ: "JWT";
  },
  Payload = JwtPayload,
> {
  token: string;
  header: Header;
  payload: Payload;

  constructor(token: string) {
    this.token = token;
    const tokenValue = token?.split?.(".");
    const [headerStr, payloadStr] = tokenValue;
    this.header = this.parseHeader(headerStr);
    this.payload = this.parsepayload(payloadStr);
  }

  toString() {
    return this.token;
  }

  parseHeader(header): Header {
    return JSON.parse(decode(header));
  }

  parsepayload(payload): Payload {
    return JSON.parse(decode(payload));
  }
}
