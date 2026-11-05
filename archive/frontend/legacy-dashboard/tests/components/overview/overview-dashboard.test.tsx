// @vitest-environment jsdom
import { OverviewDashboard } from "@/components/overview/overview-dashboard";
import {
  getDashboardList,
  getDashboardOverview,
} from "@/services/api/dashboard/shared/dashboard.query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/hooks/use-i18n", () => ({
  useI18n: () => ({ locale: "en" as const }),
}));
vi.mock("@/hooks/use-dictionary", async () => {
  const { en: dictionary } = await vi.importActual<
    typeof import("@/i18n/messages/en.constant")
  >("@/i18n/messages/en.constant");
  return { useDictionary: () => dictionary };
});
vi.mock("@/services/api/dashboard/shared/dashboard.query", () => ({
  getDashboardOverview: vi.fn(),
  getDashboardList: vi.fn(),
}));

function renderOverview() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <OverviewDashboard />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.mocked(getDashboardList)
    .mockReset()
    .mockResolvedValue({
      items: [],
      pagination: { currentPage: 1, totalPages: 1, total: 0, perPage: 30 },
    });
  vi.mocked(getDashboardOverview).mockReset();
});

afterEach(cleanup);

describe("OverviewDashboard", () => {
  it("formats revenue using the currency the API reports, not a hard-coded one", async () => {
    vi.mocked(getDashboardOverview).mockResolvedValue({
      activeChairsCount: 1,
      activeBranchesCount: 1,
      bookingsCount: 1,
      completedBookingsCount: 1,
      revenue: 42,
      revenueCurrency: "JOD",
      stylistsCount: 1,
      todayBookingsCount: 1,
    });
    renderOverview();

    const revenueTile = await screen.findByText(/JD|JOD/);
    expect(revenueTile.textContent).not.toContain("USD");
    expect(revenueTile.textContent).not.toContain("$");
  });

  it("falls back to the raw number when the API reports no currency", async () => {
    vi.mocked(getDashboardOverview).mockResolvedValue({
      activeChairsCount: 0,
      activeBranchesCount: 0,
      bookingsCount: 0,
      completedBookingsCount: 0,
      revenue: 0,
      revenueCurrency: null,
      stylistsCount: 0,
      todayBookingsCount: 0,
    });
    renderOverview();

    const revenueTitle = screen.getByText("Revenue");
    const revenueCard = revenueTitle.closest("div[class*='rounded-xl']");
    await vi.waitFor(() => expect(revenueCard?.textContent).not.toContain("—"));
    expect(revenueCard?.textContent).toContain("0");
  });

  it("never hard-codes a currency code in source", () => {
    const source = readFileSync(
      "src/components/overview/overview-dashboard.tsx",
      "utf-8",
    );
    expect(source).not.toMatch(/currency:\s*["']USD["']/);
  });
});
