const SECRET = "test-secret-test-secret-test-secret-0123";
const ENCODER = new TextEncoder();

function base64Url(bytes: Uint8Array | string): string {
  const raw = typeof bytes === "string" ? bytes : String.fromCharCode(...bytes);
  return btoa(raw).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export const TEST_SECRET = SECRET;

export async function signClaim(overrides: Record<string, unknown> = {}, secret: string = SECRET): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "HS256", typ: "JWT", kid: "default" }));
  const payload = base64Url(
    JSON.stringify({
      actor_type: "branch",
      role: "branch_manager",
      sub: "7",
      branch_id: 3,
      iat: now,
      exp: now + 3600,
      iss: "dorak-backend",
      jti: "jti-1",
      ...overrides,
    }),
  );
  const key = await crypto.subtle.importKey("raw", ENCODER.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, ENCODER.encode(`${header}.${payload}`));
  return `${header}.${payload}.${base64Url(new Uint8Array(signature))}`;
}
