import { BACKEND_PATH } from "@/config/backend.constant";
import { REFRESH_REPLAY_WINDOW_MS } from "@/config/refresh-coordination.constant";
import { HttpMethod } from "@/enums/access/http-method.enum";
import type { SessionTokens } from "@/interfaces/core/transport/session-tokens.interface";
import { backendRequest } from "@/services/api/auth/backend-client";
import { tokensFromBackendData } from "@/services/api/auth/login-data.util";

/** Refreshes in flight or just completed, keyed by the refresh token that was presented (memory only, never logged). */
const sessions = new Map<string, Promise<SessionTokens | null>>();

async function requestRefresh(refreshToken: string, claim: string | undefined, clientIp?: string): Promise<SessionTokens | null> {
  const result = await backendRequest({
    path: BACKEND_PATH.refresh,
    method: HttpMethod.Post,
    body: { refresh_token: refreshToken, ...(claim ? { claim } : {}) },
    clientIp,
  });
  return result.ok ? tokensFromBackendData(result.envelope?.data) : null;
}

/**
 * Single-flight refresh (F-05 concurrent refresh). Parallel callers presenting the same refresh token share ONE backend call, and a caller that
 * arrives within REFRESH_REPLAY_WINDOW_MS after a success gets that same session, so a loser can never answer 401 and clear the winner's cookies.
 * Failures are shared only while in flight and are never kept, so a genuinely dead refresh token is retried against the backend.
 * Coordination is per server process; the backend rotation remains single-use and is the security boundary.
 */
export function refreshSession(
  refreshToken: string,
  claim: string | undefined,
  clientIp?: string,
): Promise<SessionTokens | null> {
  const shared = sessions.get(refreshToken);
  if (shared) return shared;

  const pending = requestRefresh(refreshToken, claim, clientIp);
  sessions.set(refreshToken, pending);
  const forget = () => {
    if (sessions.get(refreshToken) === pending) sessions.delete(refreshToken);
  };
  pending.then(
    (tokens) => {
      if (!tokens) return forget();
      const timer = setTimeout(forget, REFRESH_REPLAY_WINDOW_MS);
      timer.unref?.();
    },
    forget,
  );
  return pending;
}
