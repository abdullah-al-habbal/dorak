import { describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import { en } from "@/i18n/messages/en.constant";
import { ApiClientError } from "@/services/api/client-error";
import { createQueryClient } from "@/services/api/query-client";

vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

describe("createQueryClient", () => {
  it("does not retry authorization failures", () => {
    const retry = createQueryClient().getDefaultOptions().queries?.retry;

    expect(typeof retry).toBe("function");
    if (typeof retry === "function") {
      expect(retry(0, new ApiClientError("Unauthorized", 401))).toBe(false);
      expect(retry(0, new ApiClientError("Unavailable", 503))).toBe(true);
      expect(retry(0, new ApiClientError("Not found", 404))).toBe(false);
      expect(retry(2, new ApiClientError("Unavailable", 503))).toBe(false);
    }
  });

  it("reports query and mutation failures with the dictionary current at failure time", async () => {
    const getDictionary = vi.fn(() => en);
    const client = createQueryClient(getDictionary);
    const error = new ApiClientError("Unavailable", 503);

    await client
      .fetchQuery({
        queryKey: ["failing"],
        queryFn: () => Promise.reject(error),
        retry: false,
      })
      .catch(() => null);
    expect(getDictionary).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenLastCalledWith(en.common.apiError.server);

    await client
      .getMutationCache()
      .build(client, {
        mutationFn: () => Promise.reject(error),
        onError: () => undefined,
      })
      .execute(undefined)
      .catch(() => null);
    expect(getDictionary).toHaveBeenCalledTimes(2);
    expect(toast.error).toHaveBeenCalledTimes(2);
  });

  it("does not move the failure toast into per-mutation defaults", () => {
    expect(
      createQueryClient().getDefaultOptions().mutations?.onError,
    ).toBeUndefined();
  });
});
