import type {
  ApiEnvelope,
  BackendResult,
} from "@/services/api/auth/auth.types";
import {
  isRedirectResponse,
  jsonRequestHeaders,
  readJson,
} from "@/services/api/http.util";
import { devWarn } from "@/utils/dev-warn.util";
import { hasFieldTypes } from "@/utils/guards.util";

const BACKEND_TIMEOUT_MS = 15_000;

const ENVELOPE_FIELDS = {
  success: "boolean",
  statusCode: "number",
  code: "string",
  message: "string",
  timestamp: "string",
} as const;

function isApiEnvelope<TData>(payload: unknown): payload is ApiEnvelope<TData> {
  return hasFieldTypes(payload, ENVELOPE_FIELDS);
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
      signal: init?.signal ?? AbortSignal.timeout(BACKEND_TIMEOUT_MS),
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
