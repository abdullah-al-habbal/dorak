import type { NextRequest } from "next/server";
import {
  applySessionCookies,
  clearSessionCookies,
  readSessionCookies,
} from "@/services/api/auth/cookies";
import { refreshDashboardSession } from "@/services/api/auth/session.mutation";
import { verifySessionClaim } from "@/services/api/auth/session.util";
import { API_ERROR_CODE } from "@/services/api/error-code.constant";
import { apiFailure, apiSuccess } from "@/services/api/response.util";
import { getRequestDictionary } from "@/i18n/request-dictionary.util";

export async function POST(request: NextRequest) {
  const copy = getRequestDictionary(request).common.apiError;
  const { claim, refreshToken } = readSessionCookies(request.cookies);

  if (await verifySessionClaim(claim)) {
    return apiSuccess({ refreshed: false });
  }

  const refreshed = refreshToken
    ? await refreshDashboardSession(refreshToken, claim)
    : null;
  if (!refreshed) {
    const response = apiFailure(
      401,
      API_ERROR_CODE.REFRESH_UNAUTHORIZED,
      copy.unauthorized,
    );
    clearSessionCookies(response);

    return response;
  }

  const response = apiSuccess({ refreshed: true });
  applySessionCookies(response, refreshed.cookies);

  return response;
}
