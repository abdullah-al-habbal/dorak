import { vi } from "vitest";

/** A `fetch` stub that answers once with a backend envelope at `status`. */
export function backendReply(status: number, envelope: Record<string, unknown> = {}) {
  return vi.fn().mockResolvedValue(
    new Response(JSON.stringify({ success: status < 400, statusCode: status, code: "X", message: "m", timestamp: "t", ...envelope }), {
      status,
      headers: { "content-type": "application/json" },
    }),
  );
}
