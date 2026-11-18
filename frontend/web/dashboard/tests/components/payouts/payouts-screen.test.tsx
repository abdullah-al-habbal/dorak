// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { vi } from "vitest";

import { PayoutsScreen } from "@/components/payouts/payouts-screen";
import { AuthActor } from "@/enums/access/auth-actor.enum";
import { enDictionary } from "@/locales/en/index.constant";
import { describeListStates } from "@tests/helpers/list-screen.helper";
import type { ListHarness } from "@tests/helpers/list-screen.helper";

const harness = vi.hoisted<ListHarness>(() => ({ query: {}, search: "", refetch: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }), usePathname: () => "/dashboard/x", useSearchParams: () => new URLSearchParams(harness.search) }));
vi.mock("@/hooks/earnings/use-payouts", () => ({ usePayouts: () => harness.query }));
vi.mock("@/hooks/core/state/use-overlay", () => ({ useOverlay: () => ({ open: vi.fn(), close: vi.fn() }) }));
vi.mock("@/components/payouts/payout-list", () => ({ PayoutList: () => <div data-testid="rows" /> }));

describeListStates({
  screen: () => <PayoutsScreen actor={AuthActor.Owner} />,
  forbidden: () => <PayoutsScreen actor={AuthActor.Manager} />,
  harness,
  filteredSearch: "status=paid",
  states: { ...enDictionary.payouts.states },
});
