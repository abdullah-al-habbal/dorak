import { describe, expect, it } from "vitest";

import { HttpMethod } from "@/enums/access/http-method.enum";
import { matchProxyRule } from "@/services/api/proxy/match-rule.util";

describe("matchProxyRule", () => {
  it("allows listed backend paths unchanged", () => {
    expect(matchProxyRule(HttpMethod.Get, "stylists").kind).toBe("allowed");
    expect(matchProxyRule(HttpMethod.Patch, "bookings/12/cancel").kind).toBe("allowed");
    expect(matchProxyRule(HttpMethod.Post, "bookings/walk-in").kind).toBe("allowed");
    expect(matchProxyRule(HttpMethod.Get, "currencies").kind).toBe("allowed");
    expect(matchProxyRule(HttpMethod.Get, "service-categories").kind).toBe("allowed");
    expect(matchProxyRule(HttpMethod.Post, "service-categories").kind).toBe("allowed");
    expect(matchProxyRule(HttpMethod.Delete, "service-categories").kind).not.toBe("allowed");
    expect(matchProxyRule(HttpMethod.Get, "branches/b1/opening-hours").kind).toBe("allowed");
    expect(matchProxyRule(HttpMethod.Put, "branches/b1/opening-hours").kind).toBe("allowed");
    expect(matchProxyRule(HttpMethod.Delete, "branches/b1/opening-hours").kind).not.toBe("allowed");
  });

  it("has no barbers alias for stylists", () => {
    expect(matchProxyRule(HttpMethod.Get, "barbers").kind).toBe("not-found");
  });

  it("denies unknown paths and traversal", () => {
    expect(matchProxyRule(HttpMethod.Get, "admin/no-such-route").kind).toBe("not-found");
    expect(matchProxyRule(HttpMethod.Get, "bookings/1/../brands").kind).toBe("not-found");
  });

  it("reports the allowed methods for a known path", () => {
    expect(matchProxyRule(HttpMethod.Delete, "bookings/5")).toEqual({ kind: "method-not-allowed", allow: "GET, PATCH" });
  });
});
