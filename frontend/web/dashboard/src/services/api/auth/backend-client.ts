import {
  BACKEND_DASHBOARD_PREFIX,
  BACKEND_TIMEOUT_MS,
  CLAIM_HEADER,
  FORWARDED_FOR_HEADER,
} from "@/config/backend.constant";
import { backendEnvelopeSchema } from "@/schemas/core/api/backend-envelope.zod";
import { readBackendUrl } from "@/services/api/auth/session-keys.util";
import type { BackendRequest } from "@/interfaces/core/transport/backend-request.interface";
import type { BackendResult } from "@/interfaces/core/query/backend-result.interface";

const REDIRECT_MIN = 300;
const REDIRECT_MAX = 399;

function buildHeaders(request: BackendRequest): Headers {
  // A multipart body sets its own Content-Type, with the boundary.
  const headers = new Headers({ Accept: "application/json" });
  if (!(request.body instanceof FormData)) headers.set("Content-Type", "application/json");
  if (request.accessToken) headers.set("Authorization", `Bearer ${request.accessToken}`);
  if (request.claim) headers.set(CLAIM_HEADER, request.claim);
  if (request.locale) headers.set("Accept-Language", request.locale);
  if (request.clientIp) headers.set(FORWARDED_FOR_HEADER, request.clientIp);
  return headers;
}

function failed(status: number, failure: BackendResult["failure"]): BackendResult {
  return { ok: false, status, envelope: null, failure };
}

export async function backendRequest(request: BackendRequest): Promise<BackendResult> {
  const url = `${readBackendUrl()}${BACKEND_DASHBOARD_PREFIX}${request.path}`;
  try {
    const response = await fetch(url, {
      method: request.method,
      headers: buildHeaders(request),
      body: request.body === undefined || request.body instanceof FormData ? request.body : JSON.stringify(request.body),
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS),
    });
    if (response.status >= REDIRECT_MIN && response.status <= REDIRECT_MAX) {
      return failed(response.status, "redirect");
    }
    const envelope = backendEnvelopeSchema.safeParse(await response.json().catch(() => null));
    if (!envelope.success) return failed(response.status, "invalid-response");
    return { ok: response.ok && envelope.data.success, status: response.status, envelope: envelope.data, failure: "none" };
  } catch {
    return failed(0, "transport");
  }
}
