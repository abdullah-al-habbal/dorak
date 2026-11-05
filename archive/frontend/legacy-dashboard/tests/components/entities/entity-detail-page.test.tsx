// @vitest-environment jsdom
import { EntityDetailPage } from "@/components/entities/entity-detail-page";
import { getDashboardEntity } from "@/services/api/dashboard/shared/dashboard.query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/services/api/dashboard/shared/dashboard.query", () => ({
  getDashboardEntity: vi.fn(),
}));
vi.mock("@/hooks/use-i18n", () => ({
  useI18n: () => ({ locale: "en" as const }),
}));
vi.mock("@/hooks/use-dictionary", async () => {
  const { en: dictionary } = await vi.importActual<
    typeof import("@/i18n/messages/en.constant")
  >("@/i18n/messages/en.constant");
  return { useDictionary: () => dictionary };
});

function renderDetail(
  resource: "bookings" | "branches",
  data: Record<string, unknown>,
) {
  vi.mocked(getDashboardEntity).mockResolvedValue(data);
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <EntityDetailPage actor="admin" resource={resource} id="e-1" />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.mocked(getDashboardEntity).mockReset();
});

afterEach(cleanup);

describe("EntityDetailPage", () => {
  it("renders no edit link for a booking, which has no edit route", async () => {
    renderDetail("bookings", { id: "e-1", status: "pending" });

    await waitFor(() => screen.getByText("Pending"));

    expect(screen.queryByRole("link", { name: "Edit" })).toBeNull();
  });

  it("renders an edit link for a resource that has an edit route", async () => {
    renderDetail("branches", { id: "e-1", status: "active" });

    const link = await screen.findByRole("link", { name: "Edit" });
    expect(link.getAttribute("href")).toBe("/admin/branches/e-1/edit");
  });
});
