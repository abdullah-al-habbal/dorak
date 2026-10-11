import { beforeEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { backendRequest, readSessionCookies, verifySessionClaim } = vi.hoisted(
  () => ({
    backendRequest: vi.fn(),
    readSessionCookies: vi.fn(),
    verifySessionClaim: vi.fn(),
  }),
);
vi.mock("@/services/api/auth/backend-client", () => ({ backendRequest }));
vi.mock("@/services/api/auth/cookies", () => ({ readSessionCookies }));
vi.mock("@/services/api/auth/session.util", () => ({ verifySessionClaim }));
import { GET } from "@/app/api/lookups/[resource]/route";

beforeEach(() => {
  backendRequest.mockReset();
  readSessionCookies.mockReturnValue({
    accessToken: "dashboard-token",
    claim: "claim",
  });
  verifySessionClaim.mockResolvedValue({ actor_type: "admin" });
});

it("maps a lookup resource into selector options", async () => {
  backendRequest.mockResolvedValue({
    ok: true,
    status: 200,
    envelope: { data: [{ id: "brand-1", name: { en: "Dorak", ar: "دوراك" } }] },
  });
  const response = await GET(
    new NextRequest("http://localhost/api/lookups/brands"),
    { params: Promise.resolve({ resource: "brands" }) },
  );

  expect(backendRequest).toHaveBeenCalledWith(
    "/api/v1/brands",
    expect.any(Object),
  );
  await expect(response.json()).resolves.toMatchObject({
    success: true,
    data: [{ id: "brand-1", label: "Dorak" }],
  });
});
