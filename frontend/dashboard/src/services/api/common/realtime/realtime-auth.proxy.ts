import { bearerHeaders } from "@/services/api/core/http.util";

const BROADCAST_AUTH_PATH = "/api/v1/broadcasting/auth";

function backendBaseUrl(): string {
  return (process.env.BACKEND_API_URL ?? "http://localhost:8000").replace(
    /\/+$/,
    "",
  );
}

export async function authorizeBroadcastChannel(
  token: string,
  body: string,
): Promise<{ status: number; body: string }> {
  const response = await fetch(`${backendBaseUrl()}${BROADCAST_AUTH_PATH}`, {
    method: "POST",
    headers: bearerHeaders(token),
    body,
    cache: "no-store",
  });
  return { status: response.status, body: await response.text() };
}
