import {
  BACKEND_ACTOR_TYPES,
  DASHBOARD_ROLES,
} from "@/services/api/auth/actors.constant";
import type { DashboardClaim } from "@/services/api/auth/auth.types";
import { isOneOf, isRecord } from "@/utils/guards.util";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder("utf-8", { fatal: true });

const BACKEND_ISSUER = "dorak-backend";

function base64UrlToArrayBuffer(input: string): ArrayBuffer {
  if (!/^[A-Za-z0-9_-]+$/.test(input)) {
    throw new Error("Invalid base64url segment.");
  }

  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const buffer = new ArrayBuffer(binary.length);
  const view = new Uint8Array(buffer);
  for (let index = 0; index < binary.length; index += 1) {
    view[index] = binary.charCodeAt(index);
  }

  return buffer;
}

function decodePayload<TValue>(segment: string): TValue | null {
  try {
    return JSON.parse(
      textDecoder.decode(base64UrlToArrayBuffer(segment)),
    ) as TValue;
  } catch {
    return null;
  }
}

/** Header, payload and signature segments of a compact JWS, or null when malformed. */
function splitJwt(token: string): [string, string, string] | null {
  const parts = token.split(".");
  return parts.length === 3 ? [parts[0], parts[1], parts[2]] : null;
}

function hasExactDashboardClaimShape(claim: unknown): claim is DashboardClaim {
  if (!isRecord(claim)) {
    return false;
  }

  const { iat: issuedAt, exp: expiresAt } = claim;

  if (
    !isOneOf(BACKEND_ACTOR_TYPES, claim.actor_type) ||
    !isOneOf(DASHBOARD_ROLES, claim.role) ||
    typeof claim.sub !== "string" ||
    claim.sub.length === 0 ||
    typeof claim.jti !== "string" ||
    claim.jti.length === 0 ||
    typeof issuedAt !== "number" ||
    typeof expiresAt !== "number" ||
    !Number.isSafeInteger(issuedAt) ||
    !Number.isSafeInteger(expiresAt) ||
    expiresAt <= issuedAt ||
    claim.iss !== BACKEND_ISSUER
  ) {
    return false;
  }

  if (claim.actor_type === "branch") {
    return (
      typeof claim.branch_id === "string" &&
      claim.branch_id.length > 0 &&
      claim.role === "branch_manager"
    );
  }

  return (
    claim.branch_id === undefined &&
    ((claim.actor_type === "admin" && claim.role === "platform_admin") ||
      (claim.actor_type === "barber" && claim.role === "barber"))
  );
}

/**
 * Decode a claim without verifying its signature. Only use for cheap routing
 * decisions; never trust the returned values.
 */
export function peekDashboardClaim(token: string): DashboardClaim | null {
  const parts = splitJwt(token);
  if (parts === null) {
    return null;
  }

  const claim = decodePayload<unknown>(parts[1]);
  if (!hasExactDashboardClaimShape(claim)) {
    return null;
  }

  return claim;
}

export function isClaimExpired(
  claim: DashboardClaim,
  now: number = Date.now(),
): boolean {
  return claim.exp * 1000 <= now;
}

/**
 * Verify an HS256 dashboard claim against the shared secret. Returns the claim
 * when the signature is valid and the token has not expired, otherwise null.
 */
export async function verifyDashboardClaim(
  token: string,
  secretSet: string | Record<string, string>,
  now: number = Date.now(),
): Promise<DashboardClaim | null> {
  const parts = splitJwt(token);
  if (parts === null) {
    return null;
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const header = decodePayload<unknown>(encodedHeader);
  const claim = decodePayload<unknown>(encodedPayload);
  if (
    !isRecord(header) ||
    header.alg !== "HS256" ||
    header.typ !== "JWT" ||
    typeof header.kid !== "string" ||
    !hasExactDashboardClaimShape(claim)
  ) {
    return null;
  }

  const secret =
    typeof secretSet === "string"
      ? header.kid === "default"
        ? secretSet
        : ""
      : secretSet[header.kid];
  if (typeof secret !== "string" || secret.length < 32) return null;

  let valid: boolean;
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      textEncoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );
    valid = await crypto.subtle.verify(
      "HMAC",
      key,
      base64UrlToArrayBuffer(encodedSignature),
      textEncoder.encode(`${encodedHeader}.${encodedPayload}`),
    );
  } catch {
    return null;
  }

  if (!valid || isClaimExpired(claim, now)) {
    return null;
  }

  return claim;
}
