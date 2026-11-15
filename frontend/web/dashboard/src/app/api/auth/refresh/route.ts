import { cookies } from "next/headers";

import { CLAIM_COOKIE, REFRESH_COOKIE } from "@/config/cookies.constant";
import { ApiErrorCode } from "@/enums/access/api-error-code.enum";
import { HttpStatus } from "@/enums/access/http-status.enum";
import { apiFailure, apiSuccess } from "@/lib/api-response";
import { getRequestDictionary } from "@/locales/get-request-dictionary";
import { clearSessionCookies, setSessionCookies } from "@/services/api/auth/cookies";
import { clientIpFromHeaders } from "@/services/api/auth/client-ip.util";
import { verifyClaim } from "@/services/api/auth/jwt.util";
import { refreshSession } from "@/services/api/auth/refresh";


export async function POST(request: Request) {
  const store = await cookies();
  const claim = store.get(CLAIM_COOKIE)?.value;
  if (await verifyClaim(claim)) return apiSuccess({ refreshed: false });

  const refreshToken = store.get(REFRESH_COOKIE)?.value;
  const tokens = refreshToken ? await refreshSession(refreshToken, claim, clientIpFromHeaders(request.headers)) : null;
  if (!tokens) {
    const dictionary = getRequestDictionary(request);
    const failure = apiFailure(HttpStatus.Unauthorized, ApiErrorCode.RefreshUnauthorized, dictionary.errors.api.refresh_unauthorized);
    clearSessionCookies(failure);
    return failure;
  }
  const response = apiSuccess({ refreshed: true });
  setSessionCookies(response, tokens);
  return response;
}
