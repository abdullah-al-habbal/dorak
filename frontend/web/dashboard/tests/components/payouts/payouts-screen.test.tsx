// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { vi } from "vitest";

import { PayoutsScreen } from "@/components/payouts/payouts-screen";
import { AuthActor } from "@/enums/access/auth-actor.enum";
import { enDictionary } from "@/locales/en/index.constant";
import { describeListScreen, installFetchBoundary } from "@tests/helpers/list-screen.helper";

const nav = vi.hoisted(() => ({ search: "", replace: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: nav.replace }), usePathname: () => "/dashboard/test", useSearchParams: () => new URLSearchParams(nav.search) }));

const t = enDictionary.payouts;
const march = { id: "po1", status: "approved", direction_type: "platform_to_brand", total_amount_minor: 9900, currency_code: "USD", period_started_at: "2026-03-01T00:00:00Z", period_ended_at: "2026-03-31T00:00:00Z", created_at: "2026-04-01T00:00:00Z" };
const april = { id: "po2", status: "paid", direction_type: "platform_to_brand", total_amount_minor: 4200, currency_code: "USD", period_started_at: "2026-04-01T00:00:00Z", period_ended_at: "2026-04-30T00:00:00Z", created_at: "2026-05-01T00:00:00Z" };

const server = installFetchBoundary(nav, { listPath: "/payouts?" });

describeListScreen({
  screen: () => <PayoutsScreen actor={AuthActor.Owner} />,
  forbidden: { screen: () => <PayoutsScreen actor={AuthActor.Manager} />, title: t.states.forbiddenTitle },
  server,
  nav,
  states: { ...t.states },
  rows: { records: [march, april], visibleText: [] },
  filtered: { search: "status=paid", clearLabel: t.filters.clear, sentToApi: "status=paid" },
});
