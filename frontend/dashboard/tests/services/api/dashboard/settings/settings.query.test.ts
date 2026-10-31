import { beforeEach, describe, expect, it, vi } from "vitest";

const { get, patch } = vi.hoisted(() => ({ get: vi.fn(), patch: vi.fn() }));
vi.mock("@/services/api/core/client", () => ({ api: { get, patch } }));

import {
  getPlatformSettings,
  savePlatformSettings,
} from "@/services/api/dashboard/settings/settings.query";

const WIRE = {
  key: "explore_candidate_cap",
  group: "search",
  value: 500,
  default: 500,
  min: 50,
  max: 5000,
};

describe("platform settings queries", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reads and validates the admin settings list", async () => {
    get.mockResolvedValue([WIRE]);
    await expect(getPlatformSettings()).resolves.toEqual([WIRE]);
    expect(get).toHaveBeenCalledWith("/dashboard/admin/settings");
  });

  it("rejects a malformed settings payload", async () => {
    get.mockResolvedValue([{ ...WIRE, key: "unknown_key" }]);
    await expect(getPlatformSettings()).rejects.toThrow();
  });

  it("patches only the changed values", async () => {
    await savePlatformSettings({
      form: { explore_candidate_cap: "800" },
      settings: [
        {
          ...WIRE,
          key: "explore_candidate_cap" as const,
          group: "search" as const,
        },
      ],
    });
    expect(patch).toHaveBeenCalledWith("/dashboard/admin/settings", {
      settings: { explore_candidate_cap: 800 },
    });
  });
});
