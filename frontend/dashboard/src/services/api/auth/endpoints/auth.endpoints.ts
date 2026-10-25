const BASE = "/auth";

export const AuthEndpoints = {
  login: `${BASE}/login`,
  logout: `${BASE}/logout`,
  refresh: `${BASE}/refresh`,
} as const;
