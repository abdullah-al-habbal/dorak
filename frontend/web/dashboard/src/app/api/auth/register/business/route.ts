import { cookies } from "next/headers";

import { BACKEND_PATH } from "@/config/backend.constant";
import { LOCALE_COOKIE } from "@/config/cookies.constant";
import { ApiErrorCode } from "@/enums/api-error-code.enum";
import { HttpMethod } from "@/enums/http-method.enum";
import { HttpStatus } from "@/enums/http-status.enum";
import { apiFailure, apiSuccess } from "@/lib/api-response";
import { getRequestDictionary } from "@/locales/get-request-dictionary";
import { resolveLocale } from "@/locales/resolve-locale.util";
import { registerBusinessBodySchema } from "@/schemas/account/register-business-body.zod";
import { backendRequest } from "@/services/api/auth/backend-client";
import { clientIpFromHeaders } from "@/services/api/auth/client-ip.util";
import { failureFromBackend } from "@/services/api/auth/failure-response";

/** Public. The answer is the same for any email, so it never says whether an account exists. */
export async function POST(request: Request) {
  const dictionary = getRequestDictionary(request);
  const body = registerBusinessBodySchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return apiFailure(HttpStatus.BadRequest, ApiErrorCode.InvalidRequest, dictionary.errors.api.invalid_request);
  }

  const store = await cookies();
  const result = await backendRequest({
    path: BACKEND_PATH.ownerRegister,
    method: HttpMethod.Post,
    body: body.data,
    locale: resolveLocale(store.get(LOCALE_COOKIE)?.value, request.headers.get("accept-language")),
    clientIp: clientIpFromHeaders(request.headers),
  });
  if (!result.ok) return failureFromBackend(result, dictionary);
  return apiSuccess({ accepted: true });
}
