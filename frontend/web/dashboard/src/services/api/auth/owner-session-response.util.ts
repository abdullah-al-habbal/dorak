import type { NextResponse } from "next/server";

import { SECONDS_PER_YEAR } from "@/config/backend.constant";
import { LAST_GUARD_COOKIE } from "@/config/cookies.constant";
import { ApiErrorCode } from "@/enums/api-error-code.enum";
import { AuthActor } from "@/enums/auth-actor.enum";
import { HttpStatus } from "@/enums/http-status.enum";
import type { BackendResult } from "@/interfaces/core/backend-result.interface";
import type { Dictionary } from "@/types/core/dictionary.type";
import { apiFailure, apiSuccess } from "@/lib/api-response";
import { failureFromBackend } from "@/services/api/auth/failure-response";
import { setSessionCookies } from "@/services/api/auth/cookies";
import { tokensFromBackendData } from "@/services/api/auth/login-data.util";

/** Turns a backend answer that carries an owner session (verify, or first brand) into the cookies the portal reads. */
export async function ownerSessionResponse(result: BackendResult, dictionary: Dictionary): Promise<NextResponse> {
  if (!result.ok) return failureFromBackend(result, dictionary);
  const tokens = await tokensFromBackendData(result.envelope?.data, AuthActor.Owner);
  if (!tokens) {
    return apiFailure(HttpStatus.BadGateway, ApiErrorCode.SessionSetupFailed, dictionary.errors.api.session_setup_failed);
  }
  const response = apiSuccess({ actor: AuthActor.Owner });
  setSessionCookies(response, tokens);
  response.cookies.set(LAST_GUARD_COOKIE, AuthActor.Owner, { path: "/", sameSite: "lax", maxAge: SECONDS_PER_YEAR });
  return response;
}
