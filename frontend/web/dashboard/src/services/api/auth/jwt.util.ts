import { CLAIM_ISSUER } from "@/config/backend.constant";
import { jwtHeaderSchema } from "@/schemas/core/session/jwt-header.zod";
import { sessionClaimSchema } from "@/schemas/core/session/session-claim.zod";
import { readKeyRing } from "@/services/api/auth/session-keys.util";
import type { SessionClaim } from "@/types/core/session/session-claim.type";

const TEXT = new TextEncoder();
const MS_PER_SECOND = 1000;
const JWT_PARTS = 3;

function decodeBase64Url(value: string): Uint8Array<ArrayBuffer> {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function decodeJson(value: string): unknown {
  return JSON.parse(new TextDecoder().decode(decodeBase64Url(value)));
}

async function verifySignature(secret: string, signed: string, signature: string): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    "raw",
    TEXT.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  return crypto.subtle.verify("HMAC", key, decodeBase64Url(signature), TEXT.encode(signed));
}

function isLive(claim: SessionClaim, nowSeconds: number): boolean {
  return claim.iss === CLAIM_ISSUER && claim.exp > claim.iat && claim.exp > nowSeconds;
}

export async function verifyClaim(
  token: string | undefined,
  nowMs: number = Date.now(),
): Promise<SessionClaim | null> {
  const ring = readKeyRing();
  const parts = token?.split(".") ?? [];
  if (!ring || parts.length !== JWT_PARTS) return null;
  const [header, payload, signature] = parts;
  try {
    const parsedHeader = jwtHeaderSchema.safeParse(decodeJson(header));
    const secret = parsedHeader.success ? ring[parsedHeader.data.kid] : undefined;
    if (!secret || !(await verifySignature(secret, `${header}.${payload}`, signature))) return null;
    const claim = sessionClaimSchema.safeParse(decodeJson(payload));
    return claim.success && isLive(claim.data, Math.floor(nowMs / MS_PER_SECOND)) ? claim.data : null;
  } catch {
    return null;
  }
}
