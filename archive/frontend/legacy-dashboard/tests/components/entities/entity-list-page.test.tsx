// @vitest-environment jsdom
import { EntityListPage } from "@/components/entities/entity-list-page";
import { getDashboardList } from "@/services/api/dashboard/shared/dashboard.query";
import type { DashboardResource } from "@/services/api/dashboard/shared/types/dashboard-resource.types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const session = { actor: "admin" as const, branchId: null };

vi.mock("@/hooks/use-session", () => ({ useSession: () => session }));
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
  getDashboardList: vi.fn(),
}));

function renderList(
  resource: Exclude<DashboardResource, "overview"> = "bookings",
) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <EntityListPage resource={resource} />
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
          starts_at: "2026-10-26T09:00:00Z",
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

  it("sends the booking filters as query params once changed", async () => {
    const user = userEvent.setup();
    renderList();
    await screen.findByRole("link", { name: "Details" });
    vi.mocked(getDashboardList).mockClear();

    await user.type(screen.getByLabelText("Chair ID"), "chair-1");

    await screen.findByRole("link", { name: "Details" });
    expect(getDashboardList).toHaveBeenLastCalledWith(
      "bookings",
      expect.objectContaining({ chairId: "chair-1" }),
    );
  });

  it("sends the client-name search for bookings", async () => {
    const user = userEvent.setup();
    renderList();
    await screen.findByRole("link", { name: "Details" });
    vi.mocked(getDashboardList).mockClear();

    await user.type(screen.getByLabelText("Search records"), "sara");

    await vi.waitFor(() =>
      expect(getDashboardList).toHaveBeenLastCalledWith(
        "bookings",
        expect.objectContaining({ search: "sara" }),
      ),
    );
  });
});

describe("EntityListPage (branches search)", () => {
  beforeEach(() => {
    vi.mocked(getDashboardList)
      .mockReset()
      .mockResolvedValue({
        items: [],
        pagination: { currentPage: 1, totalPages: 1, total: 0, perPage: 30 },
      });
  });

  it("debounces the search input to one request after 300ms", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({
      advanceTimers: (ms) => vi.advanceTimersByTime(ms),
    });
    renderList("branches");
    await vi.waitFor(() => expect(getDashboardList).toHaveBeenCalledTimes(1));
    vi.mocked(getDashboardList).mockClear();

    await user.type(screen.getByLabelText("Search records"), "sal");
    expect(getDashboardList).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(300);
    await vi.waitFor(() =>
      expect(getDashboardList).toHaveBeenCalledWith(
        "branches",
        expect.objectContaining({ search: "sal" }),
      ),
    );
    expect(getDashboardList).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
