// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { vi } from "vitest";

import { BookingsScreen } from "@/components/bookings/bookings-screen";
import { AuthActor } from "@/enums/access/auth-actor.enum";
import { enDictionary } from "@/locales/en/index.constant";
import { describeListStates } from "@tests/helpers/list-screen.helper";
import type { ListHarness } from "@tests/helpers/list-screen.helper";

const harness = vi.hoisted<ListHarness>(() => ({ query: {}, search: "", refetch: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }), usePathname: () => "/dashboard/manager/bookings", useSearchParams: () => new URLSearchParams(harness.search) }));
vi.mock("@/hooks/bookings/use-bookings-query", () => ({ useBookingsQuery: () => harness.query }));
vi.mock("@/hooks/chairs/use-chair-options", () => ({ useChairOptions: () => ({ data: [] }) }));
vi.mock("@/hooks/core/state/use-overlay", () => ({ useOverlay: () => ({ open: vi.fn(), close: vi.fn() }) }));
vi.mock("@/components/bookings/booking-toolbar", () => ({ BookingToolbar: () => null }));
vi.mock("@/components/common/filter-chips", () => ({ FilterChips: () => null }));
vi.mock("@/components/bookings/booking-grid", () => ({ BookingGrid: () => <div data-testid="rows" /> }));
vi.mock("@/components/bookings/booking-list", () => ({ BookingList: () => <div data-testid="rows" /> }));
vi.mock("@/components/bookings/dialogs/booking-detail-dialog", () => ({ BookingDetailDialog: () => null }));

describeListStates({
  screen: () => <BookingsScreen actor={AuthActor.Manager} />,
  forbidden: () => <BookingsScreen actor={AuthActor.Barber} />,
  harness,
  filteredSearch: "status=confirmed",
  states: { ...enDictionary.bookings.states },
});
