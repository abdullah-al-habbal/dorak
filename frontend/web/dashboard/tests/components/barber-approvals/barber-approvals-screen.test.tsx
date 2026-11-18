// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { vi } from "vitest";

import { BarberApprovalsScreen } from "@/components/barber-approvals/barber-approvals-screen";
import { AuthActor } from "@/enums/access/auth-actor.enum";
import { enDictionary } from "@/locales/en/index.constant";
import { describeListStates } from "@tests/helpers/list-screen.helper";
import type { ListHarness } from "@tests/helpers/list-screen.helper";

const harness = vi.hoisted<ListHarness>(() => ({ query: {}, search: "", refetch: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }), usePathname: () => "/dashboard/x", useSearchParams: () => new URLSearchParams(harness.search) }));
vi.mock("@/hooks/stylists/approvals/use-barber-approvals", () => ({ useBarberApprovals: () => harness.query }));
vi.mock("@/hooks/stylists/approvals/use-confirm-approve-barber", () => ({ useConfirmApproveBarber: () => vi.fn() }));
vi.mock("@/hooks/core/state/use-overlay", () => ({ useOverlay: () => ({ open: vi.fn(), close: vi.fn() }) }));
vi.mock("@/components/barber-approvals/barber-approval-toolbar", () => ({ BarberApprovalToolbar: () => null }));
vi.mock("@/components/barber-approvals/barber-approval-list", () => ({ BarberApprovalList: () => <div data-testid="rows" /> }));

describeListStates({
  screen: () => <BarberApprovalsScreen actor={AuthActor.Admin} />,
  forbidden: () => <BarberApprovalsScreen actor={AuthActor.Manager} />,
  harness,
  states: { ...enDictionary.barberApprovals.states },
});
