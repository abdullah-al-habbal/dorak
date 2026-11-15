import { cookies } from "next/headers";

import { BACKEND_PATH } from "@/config/backend.constant";
import { ACCESS_COOKIE, CLAIM_COOKIE, LOCALE_COOKIE, REFRESH_COOKIE } from "@/config/cookies.constant";
import { ApiErrorCode } from "@/enums/api-error-code.enum";
import { HttpMethod } from "@/enums/http-method.enum";
import { HttpStatus } from "@/enums/http-status.enum";
import { apiFailure, apiSuccess } from "@/lib/api-response";
import { getRequestDictionary } from "@/locales/get-request-dictionary";
import { resolveLocale } from "@/locales/resolve-locale.util";
import { changePasswordBodySchema } from "@/schemas/account/change-password-body.zod";
import { backendRequest } from "@/services/api/auth/backend-client";
import { clientIpFromHeaders } from "@/services/api/auth/client-ip.util";
import { failureFromBackend } from "@/services/api/auth/failure-response";
import { verifyClaim } from "@/services/api/auth/jwt.util";

/**
 * The account page's password change. It goes through this route rather than the generic proxy so the
 * backend receives this session's refresh token: the backend then signs every other session out and
 * keeps this one.
 */
export async function PUT(request: Request) {
  const dictionary = getRequestDictionary(request);
  const store = await cookies();
  const claim = store.get(CLAIM_COOKIE)?.value;
  const accessToken = store.get(ACCESS_COOKIE)?.value;
  if (!accessToken || !(await verifyClaim(claim))) {
    return apiFailure(HttpStatus.Unauthorized, ApiErrorCode.SessionExpired, dictionary.errors.api.session_expired);
  }
  const body = changePasswordBodySchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return apiFailure(HttpStatus.BadRequest, ApiErrorCode.InvalidRequest, dictionary.errors.api.invalid_request);
  }

  const result = await backendRequest({
    path: BACKEND_PATH.passwordChange,
    method: HttpMethod.Put,
    body: { ...body.data, refresh_token: store.get(REFRESH_COOKIE)?.value },
    accessToken,
    claim,
    locale: resolveLocale(store.get(LOCALE_COOKIE)?.value, request.headers.get("accept-language")),
    clientIp: clientIpFromHeaders(request.headers),
  });
  if (result.ok) return apiSuccess({ changed: true });
  if (result.status === HttpStatus.Unauthorized) {
    return apiFailure(HttpStatus.Unauthorized, ApiErrorCode.SessionExpired, dictionary.errors.api.session_expired);
  }
  return failureFromBackend(result, dictionary);
}
