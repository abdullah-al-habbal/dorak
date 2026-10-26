// @vitest-environment jsdom
import { EntityListPage } from "@/components/entities/entity-list-page";
import { getDashboardList } from "@/services/api/dashboard/shared/dashboard.query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const session = { actor: "admin" as const, branchId: null };

vi.mock("@/hooks/use-session", () => ({ useSession: () => session }));
vi.mock("@/hooks/use-dictionary", async () => {
  const { en: dictionary } = await vi.importActual<
    typeof import("@/i18n/messages/en.constant")
  >("@/i18n/messages/en.constant");
  return { useDictionary: () => dictionary };
});
vi.mock("@/services/api/dashboard/shared/dashboard.query", () => ({
  getDashboardList: vi.fn(),
}));

function renderList() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <EntityListPage resource="bookings" />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.mocked(getDashboardList)
    .mockReset()
    .mockResolvedValue({
      items: [
        {
          id: "b-1",
          status: "pending",
          time_slot: "2026-10-26T09:00:00Z",
          barber: null,
          chair: null,
          client: null,
          services: [],
        },
      ],
      pagination: { currentPage: 1, totalPages: 1, total: 1, perPage: 30 },
    });
});

afterEach(cleanup);

describe("EntityListPage (bookings)", () => {
  it("links every booking row to its detail page", async () => {
    renderList();

    const detailsLink = await screen.findByRole("link", { name: "Details" });
    expect(detailsLink.getAttribute("href")).toBe("/admin/bookings/b-1");
  });

  it("still renders the actions dialog trigger for the row", async () => {
    renderList();

    expect(await screen.findByRole("button", { name: "Manage" })).toBeTruthy();
  });
});
