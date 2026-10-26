import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { backendRequest, readSessionCookies } = vi.hoisted(() => ({
  backendRequest: vi.fn(),
  readSessionCookies: vi.fn(),
}));

vi.mock("@/services/api/auth/backend-client", () => ({ backendRequest }));
vi.mock("@/services/api/auth/cookies", () => ({ readSessionCookies }));

import {
  DELETE,
  GET,
  PATCH,
  POST,
  PUT,
} from "@/app/api/barber/[...path]/route";

const context = (path: string[]) => ({ params: Promise.resolve({ path }) });

beforeEach(() => {
  backendRequest.mockReset();
  readSessionCookies.mockReturnValue({ accessToken: "barber-token" });
});

describe("barber BFF proxy", () => {
  it("proxies a portfolio deletion to the authenticated backend route", async () => {
    backendRequest.mockResolvedValue({
      ok: true,
      status: 200,
      envelope: { data: { deleted: true } },
    });
    const request = new NextRequest(
      "http://localhost/api/barber/portfolio/photo-123",
      { method: "DELETE" },
    );

    const response = await DELETE(request, context(["portfolio", "photo-123"]));

    expect(backendRequest).toHaveBeenCalledWith(
      "/api/v1/barber/portfolio/photo-123",
      expect.objectContaining({ method: "DELETE" }),
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      data: { deleted: true },
    });
  });

  it("proxies travel-radius updates", async () => {
    backendRequest.mockResolvedValue({
      ok: true,
      status: 200,
      envelope: { data: { travel_radius: 12 } },
    });
    const request = new NextRequest(
      "http://localhost/api/barber/travel-radius",
      { method: "PATCH", body: '{"travel_radius":12}' },
    );

    const response = await PATCH(request, context(["travel-radius"]));

    expect(backendRequest).toHaveBeenCalledWith(
      "/api/v1/barber/travel-radius",
      expect.objectContaining({
        method: "PATCH",
        body: '{"travel_radius":12}',
      }),
    );
    expect(response.status).toBe(200);
  });

  it("forwards a multipart portfolio upload as FormData instead of text", async () => {
    backendRequest.mockResolvedValue({
      ok: true,
      status: 201,
      envelope: { data: { id: "p-1" } },
    });
    const formData = new FormData();
    formData.append(
      "photo",
      new File(["data"], "photo.jpg", { type: "image/jpeg" }),
    );
    const request = new NextRequest("http://localhost/api/barber/portfolio", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request, context(["portfolio"]));

    expect(backendRequest).toHaveBeenCalledWith(
      "/api/v1/barber/portfolio",
      expect.objectContaining({ method: "POST" }),
    );
    const forwardedBody = backendRequest.mock.calls[0]?.[1]?.body;
    expect(forwardedBody).toBeInstanceOf(FormData);
    expect((forwardedBody as FormData).get("photo")).toBeInstanceOf(File);
    expect(response.status).toBe(200);
  });

  it.each([
    { method: "GET", path: ["travel-radius"], handler: GET },
    { method: "POST", path: ["profile"], handler: POST },
    { method: "PUT", path: ["profile", "x"], handler: PUT },
  ])(
    "rejects unlisted $method $path without calling the backend",
    async ({ method, path, handler }) => {
      const response = await handler(
        new NextRequest(`http://localhost/api/barber/${path.join("/")}`, {
          method,
        }),
        context(path),
      );

      expect(response.status).toBe(404);
      expect(backendRequest).not.toHaveBeenCalled();
    },
  );
});
