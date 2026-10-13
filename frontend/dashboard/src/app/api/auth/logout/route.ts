import { ROUTES } from "@/config/routes.constant";
import type { NextRequest } from "next/server";
import { backendRequest } from "@/services/api/auth/backend-client";
import {
  clearSessionCookies,
  readSessionCookies,
} from "@/services/api/auth/cookies";
import { bearerHeaders } from "@/services/api/http.util";
import { apiSuccess } from "@/services/api/response.util";

export async function POST(request: NextRequest) {
  const { accessToken, refreshToken, claim } = readSessionCookies(
    request.cookies,
  );

  if (accessToken) {
    await backendRequest(ROUTES.api.dashboard.logout, {
      method: "POST",
      headers: bearerHeaders(accessToken),
      body: JSON.stringify({ refresh_token: refreshToken, claim }),
    });
  }

  const response = apiSuccess({});
  clearSessionCookies(response);

  return response;
}
