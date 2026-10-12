import { ROUTES } from "@/config/routes.constant";
import { BACKEND_ACTOR_TYPE } from "@/services/api/auth/actors.constant";
import { backendRequest } from "@/services/api/auth/backend-client";
import { applySessionCookies } from "@/services/api/auth/cookies";
import { parseLoginBody } from "@/services/api/auth/login-body.util";
import { sessionFromBackendLoginData } from "@/services/api/auth/session.util";
import type { BackendLoginData } from "@/services/api/auth/auth.types";
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
      "invalid_request",
      dictionary.common.apiError.validation,
    );
  }

  const credentials = parseLoginBody(body);
  if (credentials === null) {
    return apiFailure(
      400,
      "invalid_credentials",
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
      envelope?.code ?? "sign_in_failed",
      dictionary.common.apiError.unauthorized,
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
      "session_setup_failed",
      dictionary.common.apiError.server,
    );
  }

  const response = apiSuccess({ actor });
  applySessionCookies(response, session.cookies);

  return response;
}
