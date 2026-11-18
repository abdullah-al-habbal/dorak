// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { vi } from "vitest";

import { ChairsScreen } from "@/components/chairs/chairs-screen";
import { AuthActor } from "@/enums/access/auth-actor.enum";
import { enDictionary } from "@/locales/en/index.constant";
import { describeListStates } from "@tests/helpers/list-screen.helper";
import type { ListHarness } from "@tests/helpers/list-screen.helper";

const harness = vi.hoisted<ListHarness>(() => ({ query: {}, search: "", refetch: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }), usePathname: () => "/dashboard/manager/chairs", useSearchParams: () => new URLSearchParams(harness.search) }));
vi.mock("@/hooks/chairs/use-chairs", () => ({ useChairs: () => harness.query }));
vi.mock("@/hooks/chairs/use-chair-status-toggle", () => ({ useChairStatusToggle: () => ({ toggle: vi.fn(), togglingId: null }) }));
vi.mock("@/hooks/branches/use-branch-options", () => ({ useBranchOptions: () => ({ data: [] }) }));
vi.mock("@/hooks/core/state/use-auth-store", () => ({ useAuthStore: () => null }));
vi.mock("@/hooks/core/state/use-overlay", () => ({ useOverlay: () => ({ open: vi.fn(), close: vi.fn() }) }));
vi.mock("@/components/chairs/chair-toolbar", () => ({ ChairToolbar: () => null }));
vi.mock("@/components/common/filter-chips", () => ({ FilterChips: () => null }));
vi.mock("@/components/floor-plan/floor-plan-panel", () => ({ FloorPlanPanel: () => <div data-testid="plan" /> }));
vi.mock("@/components/chairs/chair-list", () => ({ ChairList: () => <div data-testid="rows" /> }));

describeListStates({
  screen: () => <ChairsScreen actor={AuthActor.Manager} />,
  forbidden: () => <ChairsScreen actor={AuthActor.Barber} />,
  harness,
  states: { ...enDictionary.chairs.states },
});
