import { ROUTES } from "@/config/routes.constant";
import { backendRequest } from "@/services/api/auth/backend-client";
import { readSessionCookies } from "@/services/api/auth/cookies";
import { bearerHeaders } from "@/services/api/http.util";
import { dashboardPage } from "@/services/api/dashboard/dashboard-page.util";
import {
  dashboardProfileRequestBody,
  dashboardProfileResponseData,
} from "@/services/api/dashboard/dashboard-profile-bff.util";
import { isDashboardRouteAllowed } from "@/services/api/dashboard/dashboard-path.util";
import { API_ERROR_CODE } from "@/services/api/error-code.constant";
import { apiFailure, apiSuccess, noStore } from "@/services/api/response.util";
import { getRequestDictionary } from "@/i18n/request-dictionary.util";
import type { NextRequest } from "next/server";

interface Context {
  params: Promise<{ path: string[] }>;
}

export async function GET(request: NextRequest, context: Context) {
  return proxyDashboardRequest(request, context);
}
export async function POST(request: NextRequest, context: Context) {
  return proxyDashboardRequest(request, context);
}
export async function PUT(request: NextRequest, context: Context) {
  return proxyDashboardRequest(request, context);
}
export async function PATCH(request: NextRequest, context: Context) {
  return proxyDashboardRequest(request, context);
}
export async function DELETE(request: NextRequest, context: Context) {
  return proxyDashboardRequest(request, context);
}

async function proxyDashboardRequest(request: NextRequest, context: Context) {
  const copy = getRequestDictionary(request).common.apiError;
  const { path } = await context.params;
  if (!isDashboardRouteAllowed(request.method, path))
    return noStore(
      apiFailure(404, API_ERROR_CODE.RESOURCE_NOT_FOUND, copy.notFound),
    );

  const { accessToken: token, claim } = readSessionCookies(request.cookies);
  if (!token)
    return noStore(
      apiFailure(401, API_ERROR_CODE.SESSION_EXPIRED, copy.unauthorized),
    );

  const rawBody =
    request.method === "GET" || request.method === "DELETE"
      ? undefined
      : await request.text();
  const body =
    rawBody && (path[0] === "profile" || path[0] === "settings")
      ? dashboardProfileRequestBody(rawBody)
      : rawBody;
  const result = await backendRequest<unknown>(
    `${ROUTES.api.dashboard.root}/${path.join("/")}${request.nextUrl.search}`,
    {
      method: request.method,
      headers: {
        ...bearerHeaders(token),
        ...(claim ? { "X-Dashboard-Session": claim } : {}),
      },
      ...(body ? { body } : {}),
    },
  );
  if (!result.ok || result.envelope?.data === undefined) {
    return noStore(
      apiFailure(
        result.status || 502,
        result.envelope?.code ?? API_ERROR_CODE.DASHBOARD_REQUEST_FAILED,
        copy.server,
        result.envelope?.errors,
      ),
    );
  }

  const rawData =
    path.length === 1 &&
    path[0] !== "overview" &&
    Array.isArray(result.envelope.data)
      ? dashboardPage(result.envelope.data, result.envelope.meta)
      : result.envelope.data;
  const data =
    path[0] === "profile" || path[0] === "settings"
      ? dashboardProfileResponseData(rawData)
      : rawData;
  return noStore(apiSuccess(data));
}
