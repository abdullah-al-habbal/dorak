// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { vi } from "vitest";

import { AdminUsersScreen } from "@/components/admin-users/admin-users-screen";
import { AuthActor } from "@/enums/access/auth-actor.enum";
import { enDictionary } from "@/locales/en/index.constant";
import { describeListStates } from "@tests/helpers/list-screen.helper";
import type { ListHarness } from "@tests/helpers/list-screen.helper";

const harness = vi.hoisted<ListHarness>(() => ({ query: {}, search: "", refetch: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }), usePathname: () => "/dashboard/x", useSearchParams: () => new URLSearchParams(harness.search) }));
vi.mock("@/hooks/platform/admin-users/use-admin-users", () => ({ useAdminUsers: () => harness.query }));
vi.mock("@/hooks/account/use-account-profile", () => ({ useAccountProfile: () => ({ data: undefined }) }));
vi.mock("@/hooks/platform/admin-users/use-confirm-admin-user-active", () => ({ useConfirmAdminUserActive: () => vi.fn() }));
vi.mock("@/hooks/platform/admin-users/use-resend-admin-invite", () => ({ useResendAdminInvite: () => ({ mutate: vi.fn() }) }));
vi.mock("@/hooks/core/state/use-overlay", () => ({ useOverlay: () => ({ open: vi.fn(), close: vi.fn() }) }));
vi.mock("@/components/admin-users/admin-user-toolbar", () => ({ AdminUserToolbar: () => null }));
vi.mock("@/components/admin-users/admin-user-list", () => ({ AdminUserList: () => <div data-testid="rows" /> }));

describeListStates({
  screen: () => <AdminUsersScreen actor={AuthActor.Admin} />,
  forbidden: () => <AdminUsersScreen actor={AuthActor.Manager} />,
  harness,
  states: { ...enDictionary.adminUsers.states },
});
