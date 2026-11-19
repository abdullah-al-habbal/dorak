// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { vi } from "vitest";

import { AdminSubscriptionsScreen } from "@/components/admin-subscriptions/admin-subscriptions-screen";
import { AuthActor } from "@/enums/access/auth-actor.enum";
import { enDictionary } from "@/locales/en/index.constant";
import { describeListScreen, installFetchBoundary } from "@tests/helpers/list-screen.helper";

const nav = vi.hoisted(() => ({ search: "", replace: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: nav.replace }), usePathname: () => "/dashboard/test", useSearchParams: () => new URLSearchParams(nav.search) }));

const t = enDictionary.adminSubscriptions;
const live = { id: "s1", status: "active", brand: { id: "b1", name: { en: "Northside Cuts", ar: "الشمال" } }, plan: { id: "p1", name: { en: "Professional", ar: "محترف" } }, starts_at: "2026-01-01T00:00:00Z" };
const lapsed = { id: "s2", status: "past_due", brand: { id: "b2", name: { en: "Harbor Barbers", ar: "الميناء" } }, plan: { id: "p1", name: { en: "Basic", ar: "أساسي" } }, starts_at: "2026-01-01T00:00:00Z" };

const server = installFetchBoundary(nav, { listPath: "/admin/subscriptions?" });

describeListScreen({
  screen: () => <AdminSubscriptionsScreen actor={AuthActor.Admin} />,
  forbidden: { screen: () => <AdminSubscriptionsScreen actor={AuthActor.Manager} />, title: t.states.forbiddenTitle },
  server,
  nav,
  states: { ...t.states },
  rows: { records: [live, lapsed], visibleText: ["Northside Cuts", "Professional", "Harbor Barbers"] },
  filtered: { search: "status=active", clearLabel: t.filters.clear, sentToApi: "status=active" },
});
