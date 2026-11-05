/** Manual-redirect fetches surface as opaque redirects (browser) or raw 3xx (server). */
export function isRedirectResponse(response: Response): boolean {
  return (
    response.type === "opaqueredirect" ||
    (response.status >= 300 && response.status < 400)
  );
}

/**
 * JSON request headers; `Content-Type` is only added when a body is sent and
 * none was set. A `FormData` body is left without an explicit `Content-Type`
 * so `fetch` can set the multipart boundary itself.
 */
export function jsonRequestHeaders(init?: RequestInit): Headers {
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");
  if (
    init?.body !== undefined &&
    !(init.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }
  return headers;
}

export function bearerHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

/** Parsed JSON body, or null when the body is empty or malformed. */
export function readJson(response: Response): Promise<unknown> {
  return response.json().catch(() => null);
}
