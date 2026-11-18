// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { vi } from "vitest";

import { AdminBrandsScreen } from "@/components/admin-brands/admin-brands-screen";
import { AuthActor } from "@/enums/access/auth-actor.enum";
import { enDictionary } from "@/locales/en/index.constant";
import { describeListStates } from "@tests/helpers/list-screen.helper";
import type { ListHarness } from "@tests/helpers/list-screen.helper";

const harness = vi.hoisted<ListHarness>(() => ({ query: {}, search: "", refetch: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }), usePathname: () => "/dashboard/x", useSearchParams: () => new URLSearchParams(harness.search) }));
vi.mock("@/hooks/brands/admin/use-admin-brands", () => ({ useAdminBrands: () => harness.query }));
vi.mock("@/hooks/brands/admin/use-confirm-approve-brand", () => ({ useConfirmApproveBrand: () => vi.fn() }));
vi.mock("@/hooks/core/state/use-overlay", () => ({ useOverlay: () => ({ open: vi.fn(), close: vi.fn() }) }));
vi.mock("@/components/admin-brands/admin-brand-toolbar", () => ({ AdminBrandToolbar: () => null }));
vi.mock("@/components/admin-brands/admin-brand-list", () => ({ AdminBrandList: () => <div data-testid="rows" /> }));

describeListStates({
  screen: () => <AdminBrandsScreen actor={AuthActor.Admin} />,
  forbidden: () => <AdminBrandsScreen actor={AuthActor.Manager} />,
  harness,
  states: { ...enDictionary.adminBrands.states },
});
