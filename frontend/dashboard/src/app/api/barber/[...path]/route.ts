import { ROUTES } from "@/config/routes.constant";
import { backendRequest } from "@/services/api/auth/backend-client";
import { readSessionCookies } from "@/services/api/auth/cookies";
import { bearerHeaders } from "@/services/api/http.util";
import { apiFailure, apiSuccess, noStore } from "@/services/api/response.util";
import { getRequestDictionary } from "@/i18n/request-dictionary.util";
import type { NextRequest } from "next/server";

interface Context {
  params: Promise<{ path: string[] }>;
}
const ALLOWED_PATHS = new Set([
  "profile",
  "portfolio",
  "schedule",
  "appointments/today",
  "travel-radius",
  "workstation-status",
]);
const BOOKING_TRANSITION_PATH =
  /^bookings\/[A-Za-z0-9-]+\/(accept|start|complete|no-show|cancel)$/;
const PORTFOLIO_ITEM_PATH = /^portfolio\/[A-Za-z0-9-]+$/;

export async function GET(request: NextRequest, context: Context) {
  return proxyBarberRequest(request, context);
}
export async function PATCH(request: NextRequest, context: Context) {
  return proxyBarberRequest(request, context);
}
export async function POST(request: NextRequest, context: Context) {
  return proxyBarberRequest(request, context);
}
export async function DELETE(request: NextRequest, context: Context) {
  return proxyBarberRequest(request, context);
}

async function proxyBarberRequest(request: NextRequest, context: Context) {
  const copy = getRequestDictionary(request).common.apiError;
  const { path } = await context.params;
  const joined = path.join("/");
  const isAllowed =
    ALLOWED_PATHS.has(joined) ||
    BOOKING_TRANSITION_PATH.test(joined) ||
    (request.method === "DELETE" && PORTFOLIO_ITEM_PATH.test(joined));
  if (!isAllowed)
    return noStore(apiFailure(404, "resource_not_found", copy.notFound));
  const token = readSessionCookies(request.cookies).accessToken;
  if (!token)
    return noStore(apiFailure(401, "session_expired", copy.unauthorized));
  const body = request.method === "GET" ? undefined : await request.text();
  const result = await backendRequest<unknown>(
    `${ROUTES.api.barber.root}/${joined}${request.nextUrl.search}`,
    {
      method: request.method,
      headers: bearerHeaders(token),
      ...(body ? { body } : {}),
    },
  );
  if (!result.ok || result.envelope?.data === undefined)
    return noStore(
      apiFailure(
        result.status || 502,
        result.envelope?.code ?? "barber_request_failed",
        copy.server,
        result.envelope?.errors,
      ),
    );
  const data =
    joined === "appointments/today" && Array.isArray(result.envelope.data)
      ? { items: result.envelope.data }
      : result.envelope.data;
  return noStore(apiSuccess(data));
}
