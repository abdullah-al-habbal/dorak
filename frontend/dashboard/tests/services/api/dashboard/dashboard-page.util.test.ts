import { dashboardPage } from "@/services/api/dashboard/dashboard-page.util";
import { describe, expect, it } from "vitest";

describe("dashboardPage", () => {
  it("normalizes legacy pagination metadata", () => {
    expect(
      dashboardPage(["one", "two"], {
        pagination: { current_page: 2, per_page: 2, total: 10, total_pages: 5 },
      }),
    ).toEqual({
      items: ["one", "two"],
      pagination: { currentPage: 2, perPage: 2, total: 10, totalPages: 5 },
    });
  });

  it("uses safe defaults when backend metadata is absent", () => {
    expect(dashboardPage(["one"], null).pagination).toEqual({
      currentPage: 1,
      perPage: 1,
      total: 1,
      totalPages: 1,
    });
  });
});
