import { ApiClientError } from "@/services/api/core/client-error";
import type { ApiFailureKind } from "@/services/api/core/types/client-error.types";
import type { ApiRequestOptions } from "@/services/api/core/types/client.types";
import type { ApiSuccess } from "@/services/api/core/types/envelope.types";
import { isApiResponse } from "@/services/api/core/envelope.util";
import { HTTP_METHOD } from "@/services/api/core/http-method.constant";
import type { HttpMethod } from "@/services/api/core/types/http-method.types";
import {
  isRedirectResponse,
  jsonRequestHeaders,
  readJson,
} from "@/services/api/core/http.util";
import { reportApiFailure } from "@/services/api/common/network-health/network-health";
import { reportSessionExpired } from "@/services/api/core/session-expiry";
import { devWarn } from "@/utils/dev-warn.util";

const REQUEST_TIMEOUT_MS = 15_000;
const API_BASE = "/api";

function clientFailure(
  message: string,
  status: number,
  kind: ApiFailureKind,
): ApiClientError {
  return new ApiClientError(message, status, undefined, undefined, kind);
}

function networkFailure(error: unknown): ApiClientError {
  if (error instanceof DOMException && error.name === "TimeoutError") {
    return clientFailure("Network request timed out.", 0, "timeout");
  }
  if (error instanceof DOMException && error.name === "AbortError") {
    return clientFailure("Network request was cancelled.", 0, "aborted");
  }
  const offline = typeof navigator !== "undefined" && !navigator.onLine;
  return offline
    ? clientFailure("Client is offline.", 0, "offline")
    : clientFailure("API is unreachable.", 0, "unreachable");
}

/** Every failed request feeds network health before it reaches TanStack Query. */
function reject(failure: ApiClientError): never {
  reportApiFailure(failure);
  throw failure;
}

export async function apiRequest<TData>(
  path: string,
  options?: ApiRequestOptions,
): Promise<TData> {
  const { auth = "public", ...init } = options ?? {};

  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      credentials: "same-origin",
      headers: jsonRequestHeaders(init),
      redirect: "manual",
      signal: init.signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    return reject(networkFailure(error));
  }

  if (isRedirectResponse(response)) {
    devWarn("Unexpected API redirect.", { path, status: response.status });
    return reject(
      clientFailure("Unexpected API redirect.", response.status, "redirect"),
    );
  }
  if (auth === "session" && response.status === 401) reportSessionExpired();

  const payload = await readJson(response);
  if (!isApiResponse(payload)) {
    return reject(
      clientFailure(
        "Invalid server response.",
        response.status,
        "invalid-response",
      ),
    );
  }
  if (!payload.success) {
    return reject(
      new ApiClientError(
        payload.message,
        response.status,
        payload.error?.code,
        payload.error?.fields,
      ),
    );
  }
  if (!response.ok) {
    return reject(
      clientFailure(
        "Invalid successful server response.",
        response.status,
        "http",
      ),
    );
  }

  reportApiFailure(null);
  return (payload as ApiSuccess<TData>).data;
}

type ApiCallOptions = Omit<ApiRequestOptions, "method" | "body">;

function send<TData>(
  method: HttpMethod,
  path: string,
  body?: unknown,
  options?: ApiCallOptions,
): Promise<TData> {
  const { auth = "session", ...init } = options ?? {};
  return apiRequest<TData>(`${API_BASE}${path}`, {
    ...init,
    auth,
    method,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

/**
 * HTTP method shortcuts over apiRequest: prepend /api, default to
 * session-scoped auth, and stringify request bodies for the caller.
 */
export const api = {
  get: <TData>(path: string, options?: ApiCallOptions) =>
    send<TData>(HTTP_METHOD.GET, path, undefined, options),
  post: <TData>(path: string, body?: unknown, options?: ApiCallOptions) =>
    send<TData>(HTTP_METHOD.POST, path, body, options),
  patch: <TData>(path: string, body?: unknown, options?: ApiCallOptions) =>
    send<TData>(HTTP_METHOD.PATCH, path, body, options),
  put: <TData>(path: string, body?: unknown, options?: ApiCallOptions) =>
    send<TData>(HTTP_METHOD.PUT, path, body, options),
  delete: <TData>(path: string, options?: ApiCallOptions) =>
    send<TData>(HTTP_METHOD.DELETE, path, undefined, options),
  /** Multipart upload: the body is sent as-is so `fetch` can set its own boundary. */
  upload: <TData>(
    path: string,
    formData: FormData,
    options?: ApiCallOptions,
  ) => {
    const { auth = "session", ...init } = options ?? {};
    return apiRequest<TData>(`${API_BASE}${path}`, {
      ...init,
      auth,
      method: HTTP_METHOD.POST,
      body: formData,
    });
  },
};
