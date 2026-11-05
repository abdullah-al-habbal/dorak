import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ACCESS_COOKIE, CLAIM_COOKIE, LOCALE_COOKIE } from "@/config/cookies.constant";
import { ApiErrorCode } from "@/enums/api-error-code.enum";
import type { HttpMethod } from "@/enums/http-method.enum";
import { apiFailure } from "@/lib/api-response";
import { getRequestDictionary } from "@/locales/get-request-dictionary";
import { resolveLocale } from "@/locales/resolve-locale.util";
import { backendRequest } from "@/services/api/auth/backend-client";
import { actorFromClaim } from "@/services/api/auth/claim-actor.util";
import { failureFromBackend } from "@/services/api/auth/failure-response";
import { verifyClaim } from "@/services/api/auth/jwt.util";
import { matchProxyRule } from "@/services/api/proxy/match-rule.util";

const HTTP_UNAUTHORIZED = 401;
const HTTP_FORBIDDEN = 403;
const HTTP_NOT_FOUND = 404;
const HTTP_METHOD_NOT_ALLOWED = 405;
const HTTP_PAYLOAD_TOO_LARGE = 413;
const HTTP_BAD_REQUEST = 400;
const HTTP_CONFLICT = 409;
const HTTP_UNPROCESSABLE = 422;
const MAX_BODY_BYTES = 256 * 1024;
const NO_STORE = { "Cache-Control": "no-store" };

type BodyResult = { ok: true; body: unknown } | { ok: false; status: number };

async function readJsonBody(request: Request): Promise<BodyResult> {
  const text = await request.text();
  if (text === "") return { ok: true, body: undefined };
  if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) return { ok: false, status: HTTP_PAYLOAD_TOO_LARGE };
  try {
    return { ok: true, body: JSON.parse(text) };
  } catch {
    return { ok: false, status: HTTP_BAD_REQUEST };
  }
}

export async function forwardDashboardRequest(
  request: Request,
  method: HttpMethod,
  segments: readonly string[],
): Promise<NextResponse> {
  const dictionary = getRequestDictionary(request);
  const match = matchProxyRule(method, segments.join("/"));
  if (match.kind === "not-found") {
    return apiFailure(HTTP_NOT_FOUND, ApiErrorCode.ResourceNotFound, dictionary.errors.api.resource_not_found);
  }
  if (match.kind === "method-not-allowed") {
    const response = apiFailure(HTTP_METHOD_NOT_ALLOWED, ApiErrorCode.InvalidRequest, dictionary.errors.api.invalid_request);
    response.headers.set("Allow", match.allow);
    return response;
  }

  const store = await cookies();
  const claimToken = store.get(CLAIM_COOKIE)?.value;
  const accessToken = store.get(ACCESS_COOKIE)?.value;
  const claim = await verifyClaim(claimToken);
  const actor = claim ? actorFromClaim(claim) : null;
  if (!actor || !accessToken) {
    return apiFailure(HTTP_UNAUTHORIZED, ApiErrorCode.SessionExpired, dictionary.errors.api.session_expired);
  }
  if (!match.rule.guards.includes(actor)) {
    return apiFailure(HTTP_FORBIDDEN, ApiErrorCode.Forbidden, dictionary.errors.api.forbidden);
  }

  const body = await readJsonBody(request);
  if (!body.ok) return apiFailure(body.status, ApiErrorCode.InvalidRequest, dictionary.errors.api.invalid_request);

  const result = await backendRequest({
    path: `/${segments.join("/")}${new URL(request.url).search}`,
    method,
    body: body.body,
    accessToken,
    claim: claimToken,
    locale: resolveLocale(store.get(LOCALE_COOKIE)?.value, request.headers.get("accept-language")),
  });

  if (result.ok && result.envelope) {
    const { message, data, meta } = result.envelope;
    return NextResponse.json({ success: true, message, data, meta }, { status: result.status, headers: NO_STORE });
  }
  if (result.status === HTTP_UNAUTHORIZED) {
    return apiFailure(HTTP_UNAUTHORIZED, ApiErrorCode.SessionExpired, dictionary.errors.api.session_expired);
  }
  if (result.status === HTTP_NOT_FOUND) {
    return apiFailure(HTTP_NOT_FOUND, ApiErrorCode.ResourceNotFound, dictionary.errors.api.resource_not_found);
  }
  if (result.status === HTTP_CONFLICT) {
    return apiFailure(HTTP_CONFLICT, ApiErrorCode.Conflict, result.envelope?.message || dictionary.errors.api.conflict);
  }
  if (result.status === HTTP_UNPROCESSABLE && result.envelope && !result.envelope.errors) {
    // A business-rule rejection: the backend's own (localized) message is the useful one.
    return apiFailure(HTTP_BAD_REQUEST, ApiErrorCode.InvalidRequest, result.envelope.message || dictionary.errors.api.invalid_request);
  }
  return failureFromBackend(result, dictionary);
}
