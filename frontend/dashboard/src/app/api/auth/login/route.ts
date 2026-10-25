import { ROUTES } from "@/config/routes.constant";
import { BACKEND_ACTOR_TYPE } from "@/services/api/auth/actors.constant";
import { backendRequest } from "@/services/api/auth/backend-client";
import { applySessionCookies } from "@/services/api/auth/cookies";
import { parseLoginBody } from "@/services/api/auth/login-body.util";
import { sessionFromBackendLoginData } from "@/services/api/auth/session.util";
import type { BackendLoginData } from "@/services/api/auth/auth.types";
import { API_ERROR_CODE } from "@/services/api/error-code.constant";
import { apiFailure, apiSuccess } from "@/services/api/response.util";
import { getRequestDictionary } from "@/i18n/request-dictionary.util";

export async function POST(request: Request) {
  const dictionary = getRequestDictionary(request);
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiFailure(
      400,
      API_ERROR_CODE.INVALID_REQUEST,
      dictionary.common.apiError.validation,
    );
  }

  const credentials = parseLoginBody(body);
  if (credentials === null) {
    return apiFailure(
      400,
      API_ERROR_CODE.INVALID_CREDENTIALS,
      dictionary.auth.invalidCredentials,
    );
  }

  const { actor, email, password } = credentials;
  const result = await backendRequest<BackendLoginData>(
    ROUTES.api.dashboard.login,
    {
      method: "POST",
      body: JSON.stringify({
        actor_type: BACKEND_ACTOR_TYPE[actor],
        email,
        password,
      }),
    },
  );

  const envelope = result.envelope;
  if (!result.ok || !envelope?.data) {
    return apiFailure(
      result.status > 0 ? result.status : 502,
      envelope?.code ?? API_ERROR_CODE.SIGN_IN_FAILED,
      envelope?.code === "ACCOUNT_BANNED"
        ? envelope.message
        : dictionary.common.apiError.unauthorized,
      envelope?.errors,
    );
  }

  const session = await sessionFromBackendLoginData(envelope.data);
  if (
    session === null ||
    session.claim.actor_type !== BACKEND_ACTOR_TYPE[actor]
  ) {
    return apiFailure(
      502,
      API_ERROR_CODE.SESSION_SETUP_FAILED,
      dictionary.common.apiError.server,
    );
  }

  const response = apiSuccess({ actor });
  applySessionCookies(response, session.cookies);

  return response;
}
