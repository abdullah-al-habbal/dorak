import type {
  ApiEnvelope,
  BackendResult,
} from "@/services/api/auth/types/auth.types";
import {
  isRedirectResponse,
  jsonRequestHeaders,
  readJson,
} from "@/services/api/core/http.util";
import { devWarn } from "@/utils/dev-warn.util";
import { hasFieldTypes } from "@/utils/guards.util";
import {
  BACKEND_CLIENT_TIMEOUT_MS,
  BACKEND_CLIENT_ENVELOPE_FIELDS,
} from "@/services/api/auth/backend-client.constant";

function isApiEnvelope<TData>(payload: unknown): payload is ApiEnvelope<TData> {
  return hasFieldTypes(payload, BACKEND_CLIENT_ENVELOPE_FIELDS);
}

function backendBaseUrl(): string {
  return (process.env.BACKEND_API_URL ?? "http://localhost:8000").replace(
    /\/+$/,
    "",
  );
}

export async function backendRequest<TData>(
  path: string,
  init?: RequestInit,
): Promise<BackendResult<TData>> {
  try {
    const response = await fetch(`${backendBaseUrl()}${path}`, {
      ...init,
      headers: jsonRequestHeaders(init),
      cache: "no-store",
      redirect: "manual",
      signal: init?.signal ?? AbortSignal.timeout(BACKEND_CLIENT_TIMEOUT_MS),
    });

    if (isRedirectResponse(response)) {
      devWarn("Unexpected backend redirect.", {
        path,
        status: response.status,
      });
      return {
        ok: false,
        status: response.status,
        envelope: null,
        failure: "redirect",
      };
    }

    const payload = await readJson(response);
    const envelope = isApiEnvelope<TData>(payload) ? payload : null;

    return {
      ok: response.ok,
      status: response.status,
      envelope,
      failure: envelope === null ? "invalid-response" : "none",
    };
  } catch {
    return { ok: false, status: 0, envelope: null, failure: "transport" };
  }
}
