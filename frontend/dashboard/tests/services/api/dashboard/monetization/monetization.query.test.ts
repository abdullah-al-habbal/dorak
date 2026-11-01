import { beforeEach, describe, expect, it, vi } from "vitest";

const { get, post, put, patch, del } = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  del: vi.fn(),
}));
vi.mock("@/services/api/core/client", () => ({
  api: { get, post, put, patch, delete: del },
}));

import {
  assignSubscription,
  deleteCommissionRule,
  deleteGateway,
  deletePlan,
  generatePayouts,
  getAnalytics,
  getCommissionEntries,
  getCommissionRules,
  getGateways,
  getPayouts,
  getPlanFeatureKeys,
  getPlans,
  getSubscriptions,
  pagedQueryKey,
  saveCommissionRule,
  saveGateway,
  savePlan,
  setGatewayActive,
  transitionPayout,
  updateSubscriptionStatus,
} from "@/services/api/dashboard/monetization/monetization.query";

const page = { items: [], pagination: { currentPage: 2 } };

beforeEach(() => {
  [get, post, put, patch, del].forEach((fn) => fn.mockReset());
});

describe("monetization requests", () => {
  it("reads paged lists with the page number and maps the items", async () => {
    get.mockResolvedValue({
      items: [{ id: "x" }],
      pagination: { currentPage: 2 },
    });
    const form = [
      getPlans,
      getSubscriptions,
      getCommissionRules,
      getCommissionEntries,
      getPayouts,
    ];
    get.mockResolvedValue(page);
    for (const read of form) {
      await expect(read(2)).resolves.toMatchObject({ items: [] });
    }
    expect(get).toHaveBeenCalledTimes(5);
    expect(get.mock.calls.map(([url]) => url)).toEqual([
      "/dashboard/admin/subscription-plans?page=2",
      "/dashboard/admin/subscriptions?page=2",
      "/dashboard/admin/commission-rules?page=2",
      "/dashboard/admin/commission-entries?page=2",
      "/dashboard/admin/payouts?page=2",
    ]);
  });

  it("reads unpaged resources", async () => {
    get.mockResolvedValueOnce([
      { id: "g", code: "a", driver: "offline", name: {} },
    ]);
    await expect(getGateways()).resolves.toHaveLength(1);
    get.mockResolvedValueOnce(["multi_branch", 1]);
    await expect(getPlanFeatureKeys()).resolves.toEqual(["multi_branch"]);
    get.mockResolvedValueOnce({ completed_bookings: 4 });
    await expect(getAnalytics()).resolves.toMatchObject({
      completedBookings: 4,
    });
  });

  it("creates or updates depending on whether an id is given", async () => {
    const plan = {
      nameEn: "a",
      nameAr: "b",
      descriptionEn: "",
      descriptionAr: "",
      price: 1,
      currencyCode: "c",
      intervalUnit: "month" as const,
      intervalCount: 1,
      isActive: true,
      featureKeys: [],
    };
    await savePlan(plan);
    await savePlan(plan, "p1");
    expect(post).toHaveBeenCalledWith(
      "/dashboard/admin/subscription-plans",
      expect.anything(),
    );
    expect(put).toHaveBeenCalledWith(
      "/dashboard/admin/subscription-plans/p1",
      expect.anything(),
    );

    const gateway = {
      code: "a",
      nameEn: "a",
      nameAr: "b",
      driver: "offline" as const,
      isActive: true,
      isDefault: false,
      config: "",
    };
    await saveGateway(gateway);
    await saveGateway(gateway, "g1");
    const rule = {
      scope: "global" as const,
      scopeId: "",
      type: "percent" as const,
      value: 1,
      currencyCode: "",
      isActive: true,
    };
    await saveCommissionRule(rule);
    await saveCommissionRule(rule, "r1");
    expect(post).toHaveBeenCalledTimes(3);
    expect(put).toHaveBeenCalledTimes(3);
  });

  it("sends the state-changing calls to the right endpoints", async () => {
    await assignSubscription({ brandId: "b1", planId: "p1" });
    expect(post).toHaveBeenLastCalledWith("/dashboard/admin/subscriptions", {
      brand_id: "b1",
      plan_id: "p1",
    });
    await updateSubscriptionStatus({ id: "s1", status: "canceled" });
    expect(patch).toHaveBeenLastCalledWith(
      "/dashboard/admin/subscriptions/s1/status",
      { status: "canceled" },
    );
    await setGatewayActive({ id: "g1", isActive: false });
    expect(patch).toHaveBeenLastCalledWith(
      "/dashboard/admin/payment-gateways/g1/active",
      { is_active: false },
    );
    await generatePayouts();
    expect(post).toHaveBeenLastCalledWith("/dashboard/admin/payouts/generate");
    await transitionPayout({ id: "po1", action: "mark-paid" });
    expect(patch).toHaveBeenLastCalledWith(
      "/dashboard/admin/payouts/po1/mark-paid",
    );
    await deletePlan("p1");
    await deleteGateway("g1");
    await deleteCommissionRule("r1");
    expect(del.mock.calls.map(([url]) => url)).toEqual([
      "/dashboard/admin/subscription-plans/p1",
      "/dashboard/admin/payment-gateways/g1",
      "/dashboard/admin/commission-rules/r1",
    ]);
  });
});

describe("pagedQueryKey", () => {
  it("builds stable paged query keys", () => {
    expect(pagedQueryKey(["dashboard", "payouts"], 2)).toEqual([
      "dashboard",
      "payouts",
      2,
      "",
    ]);
  });
});
