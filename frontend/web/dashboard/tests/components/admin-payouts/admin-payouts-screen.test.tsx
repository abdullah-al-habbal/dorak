// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { vi } from "vitest";

import { AdminPayoutsScreen } from "@/components/admin-payouts/admin-payouts-screen";
import { enDictionary } from "@/locales/en/index.constant";
import { describeListStates } from "@tests/helpers/list-screen.helper";
import type { ListHarness } from "@tests/helpers/list-screen.helper";

const harness = vi.hoisted<ListHarness>(() => ({ query: {}, search: "", refetch: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }), usePathname: () => "/dashboard/x", useSearchParams: () => new URLSearchParams(harness.search) }));
vi.mock("@/hooks/earnings/use-admin-payouts", () => ({ useAdminPayouts: () => harness.query }));
vi.mock("@/hooks/earnings/use-generate-payouts", () => ({ useGeneratePayouts: () => ({ mutate: vi.fn(), isPending: false }) }));
vi.mock("@/hooks/core/state/use-overlay", () => ({ useOverlay: () => ({ open: vi.fn(), close: vi.fn() }) }));
vi.mock("@/components/admin-payouts/admin-payout-list", () => ({ AdminPayoutList: () => <div data-testid="rows" /> }));

describeListStates({
  screen: () => <AdminPayoutsScreen />,
  harness,
  filteredSearch: "status=paid",
  states: { ...enDictionary.adminPayouts.states },
});
