const AUTH_API_BASE_PATH = "/auth";

export const AuthEndpoints = {
  login: `${AUTH_API_BASE_PATH}/login`,
  logout: `${AUTH_API_BASE_PATH}/logout`,
  refresh: `${AUTH_API_BASE_PATH}/refresh`,
} as const;
