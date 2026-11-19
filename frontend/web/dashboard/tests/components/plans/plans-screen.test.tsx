// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { vi } from "vitest";

import { PlansScreen } from "@/components/plans/plans-screen";
import { AuthActor } from "@/enums/access/auth-actor.enum";
import { enDictionary } from "@/locales/en/index.constant";
import { describeListScreen, installFetchBoundary } from "@tests/helpers/list-screen.helper";

const nav = vi.hoisted(() => ({ search: "", replace: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: nav.replace }), usePathname: () => "/dashboard/test", useSearchParams: () => new URLSearchParams(nav.search) }));

const t = enDictionary.plans;
const basic = { id: "p1", name: { en: "Basic", ar: "أساسي" }, price_amount_minor: 1000, currency: { code: "USD" }, interval_unit: "month", interval_count: 1, is_active: true, sort_order: 1, feature_keys: [] };
const pro = { id: "p2", name: { en: "Professional", ar: "محترف" }, price_amount_minor: 5000, currency: { code: "USD" }, interval_unit: "month", interval_count: 1, is_active: false, sort_order: 2, feature_keys: [] };

const server = installFetchBoundary(nav, { listPath: "/admin/subscription-plans?" });

describeListScreen({
  screen: () => <PlansScreen actor={AuthActor.Admin} />,
  forbidden: { screen: () => <PlansScreen actor={AuthActor.Manager} />, title: t.states.forbiddenTitle },
  server,
  nav,
  states: { ...t.states },
  rows: { records: [basic, pro], visibleText: ["Basic", "Professional"] },
  filtered: { search: "state=active", clearLabel: t.filters.clear, sentToApi: "active=" },
});
