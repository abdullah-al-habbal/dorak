import { describe, expect, it } from "vitest";

import { clientIpFromHeaders } from "@/services/api/auth/client-ip.util";

function headers(value?: string): Headers {
  return new Headers(value === undefined ? {} : { "x-forwarded-for": value });
}

describe("clientIpFromHeaders", () => {
  it("takes the right-most entry, the one the nearest proxy appended", () => {
    expect(clientIpFromHeaders(headers("198.51.100.7, 203.0.113.9"))).toBe("203.0.113.9");
    expect(clientIpFromHeaders(headers("2001:db8::1"))).toBe("2001:db8::1");
  });

  it("drops a missing, empty or malformed value", () => {
    expect(clientIpFromHeaders(headers())).toBeUndefined();
    expect(clientIpFromHeaders(headers(" "))).toBeUndefined();
    expect(clientIpFromHeaders(headers("1.2.3.4, evil<script>"))).toBeUndefined();
    expect(clientIpFromHeaders(headers("a".repeat(60)))).toBeUndefined();
  });
});
