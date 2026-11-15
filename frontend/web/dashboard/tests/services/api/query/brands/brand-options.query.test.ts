import { afterEach, describe, expect, it, vi } from "vitest";

import { BRANCH_OPTIONS_LIMIT } from "@/config/branch.constant";
import { BrandStatus } from "@/enums/brand-status.enum";
import { apiRequest } from "@/services/api/core/client";
import { fetchBrandOptions } from "@/services/api/query/brands/brand-options.query";

vi.mock("@/services/api/core/client", () => ({ apiRequest: vi.fn() }));

const request = vi.mocked(apiRequest);

function requestedParams(): URLSearchParams {
  const path = String(request.mock.calls[0][0]);
  return new URLSearchParams(path.slice(path.indexOf("?") + 1));
}

describe("fetchBrandOptions", () => {
  afterEach(() => {
    request.mockReset();
  });

  it("asks for every brand the actor can see when no status is given", async () => {
    request.mockResolvedValueOnce([]);
    await fetchBrandOptions();
    expect(requestedParams().get("per_page")).toBe(String(BRANCH_OPTIONS_LIMIT));
    expect(requestedParams().has("status")).toBe(false);
  });

  it("asks the backend for approved brands only when the picker must not offer pending ones", async () => {
    request.mockResolvedValueOnce([]);
    await fetchBrandOptions(BrandStatus.Active);
    expect(requestedParams().get("status")).toBe(BrandStatus.Active);
    expect(requestedParams().get("per_page")).toBe(String(BRANCH_OPTIONS_LIMIT));
  });
});
