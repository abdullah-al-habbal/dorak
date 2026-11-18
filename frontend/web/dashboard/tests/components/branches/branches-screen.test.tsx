// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { vi } from "vitest";

import { BranchesScreen } from "@/components/branches/branches-screen";
import { AuthActor } from "@/enums/access/auth-actor.enum";
import { enDictionary } from "@/locales/en/index.constant";
import { describeListStates } from "@tests/helpers/list-screen.helper";
import type { ListHarness } from "@tests/helpers/list-screen.helper";

const harness = vi.hoisted<ListHarness>(() => ({ query: {}, search: "", refetch: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }), usePathname: () => "/dashboard/x", useSearchParams: () => new URLSearchParams(harness.search) }));
vi.mock("@/hooks/branches/use-branches", () => ({ useBranches: () => harness.query }));
vi.mock("@/hooks/brands/owner/use-brand-options", () => ({ useBrandOptions: () => ({ data: [] }) }));
vi.mock("@/hooks/core/state/use-overlay", () => ({ useOverlay: () => ({ open: vi.fn(), close: vi.fn() }) }));
vi.mock("@/components/branches/branch-toolbar", () => ({ BranchToolbar: () => null }));
vi.mock("@/components/common/filter-chips", () => ({ FilterChips: () => null }));
vi.mock("@/components/branches/branch-list", () => ({ BranchList: () => <div data-testid="rows" /> }));

describeListStates({
  screen: () => <BranchesScreen actor={AuthActor.Admin} />,
  forbidden: () => <BranchesScreen actor={AuthActor.Manager} />,
  harness,
  states: { ...enDictionary.branches.states },
});
