// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { vi } from "vitest";

import { PlansScreen } from "@/components/plans/plans-screen";
import { AuthActor } from "@/enums/access/auth-actor.enum";
import { enDictionary } from "@/locales/en/index.constant";
import { describeListStates } from "@tests/helpers/list-screen.helper";
import type { ListHarness } from "@tests/helpers/list-screen.helper";

const harness = vi.hoisted<ListHarness>(() => ({ query: {}, search: "", refetch: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }), usePathname: () => "/dashboard/x", useSearchParams: () => new URLSearchParams(harness.search) }));
vi.mock("@/hooks/plans/use-plans", () => ({ usePlans: () => harness.query }));
vi.mock("@/hooks/core/state/use-overlay", () => ({ useOverlay: () => ({ open: vi.fn(), close: vi.fn() }) }));
vi.mock("@/components/plans/plan-list", () => ({ PlanList: () => <div data-testid="rows" /> }));

describeListStates({
  screen: () => <PlansScreen actor={AuthActor.Admin} />,
  forbidden: () => <PlansScreen actor={AuthActor.Manager} />,
  harness,
  filteredSearch: "state=active",
  states: { ...enDictionary.plans.states },
});
