// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { vi } from "vitest";

import { AdminSubscriptionsScreen } from "@/components/admin-subscriptions/admin-subscriptions-screen";
import { AuthActor } from "@/enums/access/auth-actor.enum";
import { enDictionary } from "@/locales/en/index.constant";
import { describeListStates } from "@tests/helpers/list-screen.helper";
import type { ListHarness } from "@tests/helpers/list-screen.helper";

const harness = vi.hoisted<ListHarness>(() => ({ query: {}, search: "", refetch: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }), usePathname: () => "/dashboard/x", useSearchParams: () => new URLSearchParams(harness.search) }));
vi.mock("@/hooks/plans/subscriptions/use-admin-subscriptions", () => ({ useAdminSubscriptions: () => harness.query }));
vi.mock("@/hooks/plans/subscriptions/use-update-subscription-status", () => ({ useUpdateSubscriptionStatus: () => ({ mutate: vi.fn(), isPending: false }) }));
vi.mock("@/hooks/core/state/use-overlay", () => ({ useOverlay: () => ({ open: vi.fn(), close: vi.fn() }) }));
vi.mock("@/components/admin-subscriptions/admin-subscription-list", () => ({ AdminSubscriptionList: () => <div data-testid="rows" /> }));

describeListStates({
  screen: () => <AdminSubscriptionsScreen actor={AuthActor.Admin} />,
  forbidden: () => <AdminSubscriptionsScreen actor={AuthActor.Manager} />,
  harness,
  filteredSearch: "status=active",
  states: { ...enDictionary.adminSubscriptions.states },
});
