import { cookies } from "next/headers";

import { BACKEND_PATH } from "@/config/backend.constant";
import { LOCALE_COOKIE } from "@/config/cookies.constant";
import { ApiErrorCode } from "@/enums/api-error-code.enum";
import { HttpMethod } from "@/enums/http-method.enum";
import { HttpStatus } from "@/enums/http-status.enum";
import { apiFailure } from "@/lib/api-response";
import { getRequestDictionary } from "@/locales/get-request-dictionary";
import { resolveLocale } from "@/locales/resolve-locale.util";
import { registerExistingBodySchema } from "@/schemas/account/register-existing-body.zod";
import { backendRequest } from "@/services/api/auth/backend-client";
import { clientIpFromHeaders } from "@/services/api/auth/client-ip.util";
import { ownerSessionResponse } from "@/services/api/auth/owner-session-response.util";

/** Public. An existing client proves their password, creates their first brand, and gets the owner session. */
export async function POST(request: Request) {
  const dictionary = getRequestDictionary(request);
  const body = registerExistingBodySchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return apiFailure(HttpStatus.BadRequest, ApiErrorCode.InvalidRequest, dictionary.errors.api.invalid_request);
  }

  const store = await cookies();
  const result = await backendRequest({
    path: BACKEND_PATH.ownerBrand,
    method: HttpMethod.Post,
    body: body.data,
    locale: resolveLocale(store.get(LOCALE_COOKIE)?.value, request.headers.get("accept-language")),
    clientIp: clientIpFromHeaders(request.headers),
  });
  return ownerSessionResponse(result, dictionary);
}
