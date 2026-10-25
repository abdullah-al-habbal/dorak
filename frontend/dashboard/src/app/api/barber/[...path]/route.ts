import { ROUTES } from "@/config/routes.constant";
import { backendRequest } from "@/services/api/auth/backend-client";
import { readSessionCookies } from "@/services/api/auth/cookies";
import { bearerHeaders } from "@/services/api/core/http.util";
import { API_ERROR_CODE } from "@/services/api/core/error-code.constant";
import {
  apiFailure,
  apiSuccess,
  noStore,
} from "@/services/api/core/response.util";
import { getRequestDictionary } from "@/i18n/request-dictionary.util";
import type { NextRequest } from "next/server";

interface Context {
  params: Promise<{ path: string[] }>;
}
const BARBER_ROUTE_RULES: ReadonlyArray<{
  method: string;
  path: RegExp;
}> = [
  { method: "GET", path: /^profile$/ },
  { method: "PATCH", path: /^profile$/ },
  { method: "GET", path: /^portfolio$/ },
  { method: "POST", path: /^portfolio$/ },
  { method: "DELETE", path: /^portfolio\/[A-Za-z0-9-]+$/ },
  { method: "GET", path: /^schedule$/ },
  { method: "PATCH", path: /^schedule$/ },
  { method: "GET", path: /^appointments\/today$/ },
  { method: "PATCH", path: /^travel-radius$/ },
  { method: "PATCH", path: /^workstation-status$/ },
  {
    method: "PATCH",
    path: /^bookings\/[A-Za-z0-9-]+\/(accept|start|complete|no-show)$/,
  },
  { method: "POST", path: /^bookings\/[A-Za-z0-9-]+\/cancel$/ },
];

export async function GET(request: NextRequest, context: Context) {
  return proxyBarberRequest(request, context);
}
export async function PATCH(request: NextRequest, context: Context) {
  return proxyBarberRequest(request, context);
}
export async function POST(request: NextRequest, context: Context) {
  return proxyBarberRequest(request, context);
}
export async function PUT(request: NextRequest, context: Context) {
  return proxyBarberRequest(request, context);
}
export async function DELETE(request: NextRequest, context: Context) {
  return proxyBarberRequest(request, context);
}

async function proxyBarberRequest(request: NextRequest, context: Context) {
  const copy = getRequestDictionary(request).common.apiError;
  const { path } = await context.params;
  const joined = path.join("/");
  const isAllowed = BARBER_ROUTE_RULES.some(
    (rule) => rule.method === request.method && rule.path.test(joined),
  );
  if (!isAllowed)
    return noStore(
      apiFailure(404, API_ERROR_CODE.RESOURCE_NOT_FOUND, copy.notFound),
    );
  const token = readSessionCookies(request.cookies).accessToken;
  if (!token)
    return noStore(
      apiFailure(401, API_ERROR_CODE.SESSION_EXPIRED, copy.unauthorized),
    );
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
        result.envelope?.code ?? API_ERROR_CODE.BARBER_REQUEST_FAILED,
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
