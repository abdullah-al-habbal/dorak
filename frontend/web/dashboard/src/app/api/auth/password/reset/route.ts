import { cookies } from "next/headers";

import { BACKEND_PATH } from "@/config/backend.constant";
import { BACKEND_ACTOR_TYPE } from "@/config/auth-actors.constant";
import { LOCALE_COOKIE } from "@/config/cookies.constant";
import { ApiErrorCode } from "@/enums/api-error-code.enum";
import { HttpMethod } from "@/enums/http-method.enum";
import { HttpStatus } from "@/enums/http-status.enum";
import { apiFailure, apiSuccess } from "@/lib/api-response";
import { getRequestDictionary } from "@/locales/get-request-dictionary";
import { resolveLocale } from "@/locales/resolve-locale.util";
import { resetPasswordBodySchema } from "@/schemas/reset-password-body.zod";
import { backendRequest } from "@/services/api/auth/backend-client";
import { clientIpFromHeaders } from "@/services/api/auth/client-ip.util";
import { failureFromBackend } from "@/services/api/auth/failure-response";

/** Public. An invalid, used or expired link comes back as a 400 with a `token` field error. */
export async function POST(request: Request) {
  const dictionary = getRequestDictionary(request);
  const body = resetPasswordBodySchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return apiFailure(HttpStatus.BadRequest, ApiErrorCode.InvalidRequest, dictionary.errors.api.invalid_request);
  }

  const { actor, ...fields } = body.data;
  const store = await cookies();
  const result = await backendRequest({
    path: BACKEND_PATH.passwordReset,
    method: HttpMethod.Post,
    body: { actor_type: BACKEND_ACTOR_TYPE[actor], ...fields },
    locale: resolveLocale(store.get(LOCALE_COOKIE)?.value, request.headers.get("accept-language")),
    clientIp: clientIpFromHeaders(request.headers),
  });
  if (!result.ok) return failureFromBackend(result, dictionary);
  return apiSuccess({ reset: true });
}
