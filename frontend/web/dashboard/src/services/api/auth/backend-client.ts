import {
  BACKEND_DASHBOARD_PREFIX,
  BACKEND_TIMEOUT_MS,
  CLAIM_HEADER,
} from "@/config/backend.constant";
import { backendEnvelopeSchema } from "@/schemas/backend-envelope.zod";
import { readBackendUrl } from "@/services/api/auth/session-keys.util";
import type { BackendRequest } from "@/interfaces/backend-request.interface";
import type { BackendResult } from "@/interfaces/backend-result.interface";

const REDIRECT_MIN = 300;
const REDIRECT_MAX = 399;

function buildHeaders(request: BackendRequest): Headers {
  const headers = new Headers({ Accept: "application/json", "Content-Type": "application/json" });
  if (request.accessToken) headers.set("Authorization", `Bearer ${request.accessToken}`);
  if (request.claim) headers.set(CLAIM_HEADER, request.claim);
  if (request.locale) headers.set("Accept-Language", request.locale);
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
      body: request.body === undefined ? undefined : JSON.stringify(request.body),
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
