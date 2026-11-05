import { describe, expect, it } from "vitest";
import {
  bearerHeaders,
  isRedirectResponse,
  jsonRequestHeaders,
  readJson,
} from "@/services/api/core/http.util";

describe("http helpers", () => {
  it("detects manual redirects", () => {
    expect(isRedirectResponse(new Response(null, { status: 302 }))).toBe(true);
    expect(isRedirectResponse(new Response(null, { status: 200 }))).toBe(false);
    expect(isRedirectResponse(new Response(null, { status: 404 }))).toBe(false);
  });

  it("adds JSON content type only for bodies without an explicit type", () => {
    expect(jsonRequestHeaders().get("Accept")).toBe("application/json");
    expect(jsonRequestHeaders().has("Content-Type")).toBe(false);
    expect(jsonRequestHeaders({ body: "{}" }).get("Content-Type")).toBe(
      "application/json",
    );
    expect(
      jsonRequestHeaders({
        body: "x",
        headers: { "Content-Type": "text/plain" },
      }).get("Content-Type"),
    ).toBe("text/plain");
  });

  it("leaves Content-Type unset for a FormData body so fetch can set the boundary", () => {
    expect(
      jsonRequestHeaders({ body: new FormData() }).has("Content-Type"),
    ).toBe(false);
  });

  it("builds bearer authorization headers", () => {
    expect(bearerHeaders("token")).toEqual({ Authorization: "Bearer token" });
  });

  it("returns null for empty or malformed JSON bodies", async () => {
    await expect(readJson(new Response('{"a":1}'))).resolves.toEqual({ a: 1 });
    await expect(readJson(new Response("not json"))).resolves.toBeNull();
    await expect(readJson(new Response(null))).resolves.toBeNull();
  });
});
