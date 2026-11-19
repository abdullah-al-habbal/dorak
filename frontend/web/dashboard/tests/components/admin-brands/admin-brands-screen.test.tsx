// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { vi } from "vitest";

import { AdminBrandsScreen } from "@/components/admin-brands/admin-brands-screen";
import { AuthActor } from "@/enums/access/auth-actor.enum";
import { enDictionary } from "@/locales/en/index.constant";
import { describeListScreen, installFetchBoundary } from "@tests/helpers/list-screen.helper";

const nav = vi.hoisted(() => ({ search: "", replace: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: nav.replace }), usePathname: () => "/dashboard/test", useSearchParams: () => new URLSearchParams(nav.search) }));

const t = enDictionary.adminBrands;
const northside = { id: "b1", name: { en: "Northside Cuts", ar: "الشمال" }, owner: { id: "o1", email: "owner@northside.test" }, status: "active", created_at: "2026-01-02T10:00:00Z", branches_count: 2 };
const harbor = { id: "b2", name: { en: "Harbor Barbers", ar: "الميناء" }, owner: { id: "o2", email: "owner@harbor.test" }, status: "pending", created_at: "2026-01-03T10:00:00Z", branches_count: 0 };

const server = installFetchBoundary(nav, { listPath: "/brands?" });

describeListScreen({
  screen: () => <AdminBrandsScreen actor={AuthActor.Admin} />,
  forbidden: { screen: () => <AdminBrandsScreen actor={AuthActor.Manager} />, title: t.states.forbiddenTitle },
  server,
  nav,
  states: { ...t.states },
  rows: { records: [northside, harbor], visibleText: ["Northside Cuts", "owner@northside.test", "Harbor Barbers"] },
  filtered: { search: "search=zzz", clearLabel: t.filters.clear, sentToApi: "search=zzz" },
});
