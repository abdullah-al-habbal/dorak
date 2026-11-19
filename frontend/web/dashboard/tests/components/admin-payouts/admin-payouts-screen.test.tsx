// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { vi } from "vitest";

import { AdminPayoutsScreen } from "@/components/admin-payouts/admin-payouts-screen";
import { enDictionary } from "@/locales/en/index.constant";
import { describeListScreen, installFetchBoundary } from "@tests/helpers/list-screen.helper";

const nav = vi.hoisted(() => ({ search: "", replace: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: nav.replace }), usePathname: () => "/dashboard/test", useSearchParams: () => new URLSearchParams(nav.search) }));

const t = enDictionary.adminPayouts;
const first = { id: "po1", status: "draft", direction_type: "platform_to_brand", total_amount_minor: 12000, currency: { code: "USD" }, brand: { id: "b1", name: { en: "Northside Cuts", ar: "الشمال" } }, period_started_at: "2026-01-01T00:00:00Z", period_ended_at: "2026-01-31T00:00:00Z", created_at: "2026-02-01T00:00:00Z" };
const second = { id: "po2", status: "paid", direction_type: "brand_to_platform", total_amount_minor: 500, currency: { code: "USD" }, brand: { id: "b2", name: { en: "Harbor Barbers", ar: "الميناء" } }, period_started_at: "2026-01-01T00:00:00Z", period_ended_at: "2026-01-31T00:00:00Z", created_at: "2026-02-01T00:00:00Z" };

const server = installFetchBoundary(nav, { listPath: "/admin/payouts?" });

describeListScreen({
  screen: () => <AdminPayoutsScreen />,
  server,
  nav,
  states: { ...t.states },
  rows: { records: [first, second], visibleText: ["Northside Cuts", "Harbor Barbers"] },
  filtered: { search: "status=paid", clearLabel: t.filters.clear, sentToApi: "status=paid" },
});
