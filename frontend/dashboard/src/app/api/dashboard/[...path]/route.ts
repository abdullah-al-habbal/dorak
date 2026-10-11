import { ROUTES } from "@/config/routes.constant";
import { backendRequest } from "@/services/api/auth/backend-client";
import { readSessionCookies } from "@/services/api/auth/cookies";
import { bearerHeaders } from "@/services/api/http.util";
import { dashboardPage } from "@/services/api/dashboard/dashboard-page.util";
import {
  dashboardProfileRequestBody,
  dashboardProfileResponseData,
} from "@/services/api/dashboard/dashboard-profile-bff.util";
import { isDashboardResourcePath } from "@/services/api/dashboard/dashboard-path.util";
import { apiFailure, apiSuccess, noStore } from "@/services/api/response.util";
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
  const { path } = await context.params;
  const token = readSessionCookies(request.cookies).accessToken;
  if (!token)
    return noStore(
      apiFailure(401, "session_expired", "Your session has expired."),
    );
  if (!isDashboardResourcePath(path))
    return noStore(
      apiFailure(404, "resource_not_found", "Dashboard resource not found."),
    );

  const rawBody =
    request.method === "GET" || request.method === "DELETE"
      ? undefined
      : await request.text();
  const body =
    rawBody && path[0] === "profile"
      ? dashboardProfileRequestBody(rawBody)
      : rawBody;
  const result = await backendRequest<unknown>(
    `${ROUTES.api.dashboard.root}/${path.join("/")}${request.nextUrl.search}`,
    {
      method: request.method,
      headers: bearerHeaders(token),
      ...(body ? { body } : {}),
    },
  );
  if (!result.ok || result.envelope?.data === undefined) {
    return noStore(
      apiFailure(
        result.status || 502,
        result.envelope?.code ?? "dashboard_request_failed",
        result.envelope?.message ?? "Dashboard service is unavailable.",
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
    path[0] === "profile" ? dashboardProfileResponseData(rawData) : rawData;
  return noStore(apiSuccess(data));
}
