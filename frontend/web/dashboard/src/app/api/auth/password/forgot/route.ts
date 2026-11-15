import { cookies } from "next/headers";

import { BACKEND_PATH } from "@/config/backend.constant";
import { BACKEND_ACTOR_TYPE } from "@/config/auth-actors.constant";
import { LOCALE_COOKIE } from "@/config/cookies.constant";
import { ApiErrorCode } from "@/enums/access/api-error-code.enum";
import { HttpMethod } from "@/enums/access/http-method.enum";
import { HttpStatus } from "@/enums/access/http-status.enum";
import { apiFailure, apiSuccess } from "@/lib/api-response";
import { getRequestDictionary } from "@/locales/get-request-dictionary";
import { resolveLocale } from "@/locales/resolve-locale.util";
import { forgotPasswordBodySchema } from "@/schemas/account/credentials/forgot-password-body.zod";
import { backendRequest } from "@/services/api/auth/backend-client";
import { clientIpFromHeaders } from "@/services/api/auth/client-ip.util";
import { failureFromBackend } from "@/services/api/auth/failure-response";

/** Public. The backend answers the same way whether or not the email has an account, and so does this route. */
export async function POST(request: Request) {
  const dictionary = getRequestDictionary(request);
  const body = forgotPasswordBodySchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return apiFailure(HttpStatus.BadRequest, ApiErrorCode.InvalidRequest, dictionary.errors.api.invalid_request);
  }

  const store = await cookies();
  const result = await backendRequest({
    path: BACKEND_PATH.passwordForgot,
    method: HttpMethod.Post,
    body: { actor_type: BACKEND_ACTOR_TYPE[body.data.actor], email: body.data.email },
    locale: resolveLocale(store.get(LOCALE_COOKIE)?.value, request.headers.get("accept-language")),
    clientIp: clientIpFromHeaders(request.headers),
  });
  if (!result.ok) return failureFromBackend(result, dictionary);
  return apiSuccess({ requested: true });
}
