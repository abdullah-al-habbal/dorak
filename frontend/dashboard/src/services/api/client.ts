import { ApiClientError } from "@/services/api/client-error";
import type { ApiFailureKind } from "@/services/api/client-error.types";
import type { ApiRequestOptions } from "@/services/api/client.types";
import type { ApiSuccess } from "@/services/api/envelope.types";
import { isApiResponse } from "@/services/api/envelope.util";
import {
  isRedirectResponse,
  jsonRequestHeaders,
  readJson,
} from "@/services/api/http.util";
import { reportApiFailure } from "@/services/api/network-health";
import { reportSessionExpired } from "@/services/api/session-expiry";
import { devWarn } from "@/utils/dev-warn.util";

const REQUEST_TIMEOUT_MS = 15_000;

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
