import { describe, expect, it } from "vitest";

import { PROXY_ALLOW_LIST } from "@/config/proxy-allow-list.constant";
import { AuthActor } from "@/enums/auth-actor.enum";
import { HttpMethod } from "@/enums/http-method.enum";

function allowed(method: HttpMethod, path: string, guard: AuthActor): boolean {
  return PROXY_ALLOW_LIST.some((rule) => rule.methods.includes(method) && rule.pattern.test(path) && rule.guards.includes(guard));
}

describe("proxy allow-list: chairs", () => {
  it.each([
    [HttpMethod.Get, "chairs"],
    [HttpMethod.Post, "chairs"],
    [HttpMethod.Get, "chairs/abc"],
    [HttpMethod.Put, "chairs/abc"],
    [HttpMethod.Delete, "chairs/abc"],
  ])("lets the manager %s %s", (method, path) => {
    expect(allowed(method, path, AuthActor.Manager)).toBe(true);
  });

  it("keeps barbers out and rejects nested or unsupported calls", () => {
    expect(allowed(HttpMethod.Get, "chairs", AuthActor.Barber)).toBe(false);
    expect(allowed(HttpMethod.Patch, "chairs/abc", AuthActor.Manager)).toBe(false);
    expect(allowed(HttpMethod.Get, "chairs/abc/extra", AuthActor.Manager)).toBe(false);
  });
});

describe("proxy allow-list: branch reviews", () => {
  it("allows reads for the manager only on the reviews path", () => {
    expect(allowed(HttpMethod.Get, "branches/b1/reviews", AuthActor.Manager)).toBe(true);
    expect(allowed(HttpMethod.Post, "branches/b1/reviews", AuthActor.Manager)).toBe(false);
    expect(allowed(HttpMethod.Get, "branches/b1/reviews", AuthActor.Barber)).toBe(false);
    expect(allowed(HttpMethod.Get, "branches/b1/reviews/r1", AuthActor.Manager)).toBe(false);
  });
});

describe("proxy allow-list: owner payouts and subscription", () => {
  it.each(["payouts", "subscription"])("allows only the owner to read %s", (path) => {
    expect(allowed(HttpMethod.Get, path, AuthActor.Owner)).toBe(true);
    expect(allowed(HttpMethod.Get, path, AuthActor.Manager)).toBe(false);
    expect(allowed(HttpMethod.Get, path, AuthActor.Barber)).toBe(false);
    expect(allowed(HttpMethod.Get, path, AuthActor.Admin)).toBe(false);
    expect(allowed(HttpMethod.Post, path, AuthActor.Owner)).toBe(false);
  });

  it("does not expose the admin payout or plan routes", () => {
    expect(allowed(HttpMethod.Get, "admin/payouts", AuthActor.Owner)).toBe(false);
    expect(allowed(HttpMethod.Get, "payouts/p1", AuthActor.Owner)).toBe(false);
  });
});
