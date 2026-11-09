import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import { BrandStatus } from "@/enums/brand-status.enum";
import { branchKeys } from "@/lib/branch-keys";

describe("branchKeys brand options", () => {
  it("keeps the active-only picker list under the brands key", () => {
    expect(branchKeys.brandsByStatus(BrandStatus.Active)).toEqual(["branches", "brands", BrandStatus.Active]);
  });

  it("refreshes the active-only list when the brands key is invalidated (approving a brand)", async () => {
    const client = new QueryClient();
    client.setQueryData(branchKeys.brands, []);
    client.setQueryData(branchKeys.brandsByStatus(BrandStatus.Active), []);

    // useApproveBrand invalidates exactly this key.
    await client.invalidateQueries({ queryKey: branchKeys.brands });

    expect(client.getQueryState(branchKeys.brands)?.isInvalidated).toBe(true);
    expect(client.getQueryState(branchKeys.brandsByStatus(BrandStatus.Active))?.isInvalidated).toBe(true);
  });
});
