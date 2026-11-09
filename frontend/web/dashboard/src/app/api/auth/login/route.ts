import { BACKEND_PATH } from "@/config/backend.constant";
import { BACKEND_ACTOR_TYPE } from "@/config/auth-actors.constant";
import { LAST_GUARD_COOKIE } from "@/config/cookies.constant";
import { SECONDS_PER_YEAR } from "@/config/backend.constant";
import { ApiErrorCode } from "@/enums/api-error-code.enum";
import { HttpMethod } from "@/enums/http-method.enum";
import { HttpStatus } from "@/enums/http-status.enum";
import { apiFailure, apiSuccess } from "@/lib/api-response";
import { getRequestDictionary } from "@/locales/get-request-dictionary";
import { loginBodySchema } from "@/schemas/login-body.zod";
import { backendRequest } from "@/services/api/auth/backend-client";
import { clientIpFromHeaders } from "@/services/api/auth/client-ip.util";
import { setSessionCookies } from "@/services/api/auth/cookies";
import { failureFromBackend } from "@/services/api/auth/failure-response";
import { tokensFromBackendData } from "@/services/api/auth/login-data.util";


export async function POST(request: Request) {
  const dictionary = getRequestDictionary(request);
  const body = loginBodySchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return apiFailure(HttpStatus.BadRequest, ApiErrorCode.InvalidRequest, dictionary.errors.api.invalid_request);
  }
  const { actor, email, password } = body.data;

  const result = await backendRequest({
    path: BACKEND_PATH.login,
    method: HttpMethod.Post,
    body: { actor_type: BACKEND_ACTOR_TYPE[actor], email, password },
    clientIp: clientIpFromHeaders(request.headers),
  });
  if (!result.ok) return failureFromBackend(result, dictionary);

  const tokens = await tokensFromBackendData(result.envelope?.data, actor);
  if (!tokens) {
    return apiFailure(HttpStatus.BadGateway, ApiErrorCode.SessionSetupFailed, dictionary.errors.api.session_setup_failed);
  }
  const response = apiSuccess({ actor });
  setSessionCookies(response, tokens);
  response.cookies.set(LAST_GUARD_COOKIE, actor, { path: "/", sameSite: "lax", maxAge: SECONDS_PER_YEAR });
  return response;
}
