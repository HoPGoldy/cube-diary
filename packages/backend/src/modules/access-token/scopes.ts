export const ACCESS_TOKEN_SCOPES = [
  "diary:read",
  "diary:write",
  "diary:export",
  "diary:import",
] as const;

export type AccessTokenScope = (typeof ACCESS_TOKEN_SCOPES)[number];

export const DEFAULT_SCOPES: AccessTokenScope[] = ["diary:read", "diary:write"];
