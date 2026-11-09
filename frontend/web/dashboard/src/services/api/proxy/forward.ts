import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ACCESS_COOKIE, CLAIM_COOKIE, LOCALE_COOKIE } from "@/config/cookies.constant";
import { ApiErrorCode } from "@/enums/api-error-code.enum";
import { HttpStatus } from "@/enums/http-status.enum";
import type { HttpMethod } from "@/enums/http-method.enum";
import { apiFailure } from "@/lib/api-response";
import { getRequestDictionary } from "@/locales/get-request-dictionary";
import { resolveLocale } from "@/locales/resolve-locale.util";
import { backendRequest } from "@/services/api/auth/backend-client";
import { actorFromClaim } from "@/services/api/auth/claim-actor.util";
import { clientIpFromHeaders } from "@/services/api/auth/client-ip.util";
import { failureFromBackend } from "@/services/api/auth/failure-response";
import { verifyClaim } from "@/services/api/auth/jwt.util";
import { matchProxyRule } from "@/services/api/proxy/match-rule.util";

const MAX_BODY_BYTES = 256 * 1024;
const NO_STORE = { "Cache-Control": "no-store" };

type BodyResult = { ok: true; body: unknown } | { ok: false; status: number };

async function readJsonBody(request: Request): Promise<BodyResult> {
  const text = await request.text();
  if (text === "") return { ok: true, body: undefined };
  if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) return { ok: false, status: HttpStatus.PayloadTooLarge };
  try {
    return { ok: true, body: JSON.parse(text) };
  } catch {
    return { ok: false, status: HttpStatus.BadRequest };
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
    return apiFailure(HttpStatus.NotFound, ApiErrorCode.ResourceNotFound, dictionary.errors.api.resource_not_found);
  }
  if (match.kind === "method-not-allowed") {
    const response = apiFailure(HttpStatus.MethodNotAllowed, ApiErrorCode.InvalidRequest, dictionary.errors.api.invalid_request);
    response.headers.set("Allow", match.allow);
    return response;
  }

  const store = await cookies();
  const claimToken = store.get(CLAIM_COOKIE)?.value;
  const accessToken = store.get(ACCESS_COOKIE)?.value;
  const claim = await verifyClaim(claimToken);
  const actor = claim ? actorFromClaim(claim) : null;
  if (!actor || !accessToken) {
    return apiFailure(HttpStatus.Unauthorized, ApiErrorCode.SessionExpired, dictionary.errors.api.session_expired);
  }
  if (!match.rule.guards.includes(actor)) {
    return apiFailure(HttpStatus.Forbidden, ApiErrorCode.Forbidden, dictionary.errors.api.forbidden);
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
    clientIp: clientIpFromHeaders(request.headers),
  });

  if (result.ok && result.envelope) {
    const { message, data, meta } = result.envelope;
    // `data` is always present: a backend reply without one (a delete) would otherwise lose the key in JSON and fail the client's envelope parse.
    return NextResponse.json({ success: true, message, data: data ?? null, meta }, { status: result.status, headers: NO_STORE });
  }
  if (result.status === HttpStatus.Unauthorized) {
    return apiFailure(HttpStatus.Unauthorized, ApiErrorCode.SessionExpired, dictionary.errors.api.session_expired);
  }
  if (result.status === HttpStatus.NotFound) {
    return apiFailure(HttpStatus.NotFound, ApiErrorCode.ResourceNotFound, dictionary.errors.api.resource_not_found);
  }
  if (result.status === HttpStatus.Conflict) {
    return apiFailure(HttpStatus.Conflict, ApiErrorCode.Conflict, result.envelope?.message || dictionary.errors.api.conflict);
  }
  if (result.status === HttpStatus.Unprocessable && result.envelope && !result.envelope.errors) {
    // A business-rule rejection: the backend's own (localized) message is the useful one.
    return apiFailure(HttpStatus.BadRequest, ApiErrorCode.InvalidRequest, result.envelope.message || dictionary.errors.api.invalid_request);
  }
  return failureFromBackend(result, dictionary);
}
