// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { vi } from "vitest";

import { StylistsScreen } from "@/components/stylists/stylists-screen";
import { AuthActor } from "@/enums/access/auth-actor.enum";
import { enDictionary } from "@/locales/en/index.constant";
import { describeListStates } from "@tests/helpers/list-screen.helper";
import type { ListHarness } from "@tests/helpers/list-screen.helper";

const harness = vi.hoisted<ListHarness>(() => ({ query: {}, search: "", refetch: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }), usePathname: () => "/dashboard/manager/stylists", useSearchParams: () => new URLSearchParams(harness.search) }));
vi.mock("@/hooks/stylists/roster/use-stylists", () => ({ useStylists: () => harness.query }));
vi.mock("@/hooks/stylists/roster/use-update-stylist-status", () => ({ useUpdateStylistStatus: () => ({ mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false, variables: undefined }) }));
vi.mock("@/hooks/branches/use-branch-options", () => ({ useBranchOptions: () => ({ data: [] }) }));
vi.mock("@/hooks/chairs/use-chair-options", () => ({ useChairOptions: () => ({ data: [] }) }));
vi.mock("@/hooks/core/state/use-auth-store", () => ({ useAuthStore: () => null }));
vi.mock("@/hooks/core/state/use-overlay", () => ({ useOverlay: () => ({ open: vi.fn(), close: vi.fn() }) }));
vi.mock("@/components/stylists/stylist-toolbar", () => ({ StylistToolbar: () => null }));
vi.mock("@/components/common/filter-chips", () => ({ FilterChips: () => null }));
vi.mock("@/components/invitations/invitations-panel", () => ({ InvitationsPanel: () => <div data-testid="invitations" /> }));
vi.mock("@/components/stylists/stylist-list", () => ({ StylistList: () => <div data-testid="rows" /> }));

describeListStates({
  screen: () => <StylistsScreen actor={AuthActor.Manager} />,
  forbidden: () => <StylistsScreen actor={AuthActor.Barber} />,
  harness,
  states: { ...enDictionary.stylists.states },
});
