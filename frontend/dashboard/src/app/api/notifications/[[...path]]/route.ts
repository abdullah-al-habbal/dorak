import { ROUTES } from "@/config/routes.constant";
import { backendRequest } from "@/services/api/auth/backend-client";
import { readSessionCookies } from "@/services/api/auth/cookies";
import { bearerHeaders } from "@/services/api/http.util";
import {
  mapNotification,
  mapNotificationInbox,
  mapNotificationReadAll,
} from "@/services/api/notification-inbox-mapper.util";
import { isNotificationRouteAllowed } from "@/services/api/notification-inbox-path.util";
import type { IBackendNotification } from "@/services/api/notification-inbox.types";
import { API_ERROR_CODE } from "@/services/api/error-code.constant";
import { apiFailure, apiSuccess, noStore } from "@/services/api/response.util";
import { getRequestDictionary } from "@/i18n/request-dictionary.util";
import type { NextRequest } from "next/server";

interface Context {
  params: Promise<{ path?: string[] }>;
}

export async function GET(request: NextRequest, context: Context) {
  return proxyNotificationRequest(request, context);
}
export async function PATCH(request: NextRequest, context: Context) {
  return proxyNotificationRequest(request, context);
}
export async function POST(request: NextRequest, context: Context) {
  return proxyNotificationRequest(request, context);
}

async function proxyNotificationRequest(
  request: NextRequest,
  context: Context,
) {
  const copy = getRequestDictionary(request).common.apiError;
  const { path = [] } = await context.params;
  const joined = path.join("/");
  if (!isNotificationRouteAllowed(request.method, joined))
    return noStore(
      apiFailure(404, API_ERROR_CODE.RESOURCE_NOT_FOUND, copy.notFound),
    );
  const token = readSessionCookies(request.cookies).accessToken;
  if (!token)
    return noStore(
      apiFailure(401, API_ERROR_CODE.SESSION_EXPIRED, copy.unauthorized),
    );
  const suffix = joined ? `/${joined}` : "";
  const result = await backendRequest<unknown>(
    `${ROUTES.api.notifications.root}${suffix}${request.nextUrl.search}`,
    { method: request.method, headers: bearerHeaders(token) },
  );
  if (!result.ok || result.envelope?.data === undefined)
    return noStore(
      apiFailure(
        result.status || 502,
        result.envelope?.code ?? API_ERROR_CODE.NOTIFICATION_REQUEST_FAILED,
        copy.server,
        result.envelope?.errors,
      ),
    );
  const { data, meta } = result.envelope;
  if (request.method === "GET")
    return noStore(apiSuccess(mapNotificationInbox(data, meta)));
  if (joined === "read-all")
    return noStore(apiSuccess(mapNotificationReadAll(data)));
  return noStore(apiSuccess(mapNotification(data as IBackendNotification)));
}
