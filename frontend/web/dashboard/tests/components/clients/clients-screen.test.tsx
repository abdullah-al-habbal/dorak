// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { vi } from "vitest";

import { ClientsScreen } from "@/components/clients/clients-screen";
import { AuthActor } from "@/enums/access/auth-actor.enum";
import { enDictionary } from "@/locales/en/index.constant";
import { describeListStates } from "@tests/helpers/list-screen.helper";
import type { ListHarness } from "@tests/helpers/list-screen.helper";

const harness = vi.hoisted<ListHarness>(() => ({ query: {}, search: "", refetch: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }), usePathname: () => "/dashboard/admin/clients", useSearchParams: () => new URLSearchParams(harness.search) }));
vi.mock("@/hooks/clients/clients/use-clients", () => ({ useClients: () => harness.query }));
vi.mock("@/hooks/clients/clients/use-confirm-unban-client", () => ({ useConfirmUnbanClient: () => vi.fn() }));
vi.mock("@/hooks/core/state/use-overlay", () => ({ useOverlay: () => ({ open: vi.fn(), close: vi.fn() }) }));
vi.mock("@/components/clients/client-toolbar", () => ({ ClientToolbar: () => null }));
vi.mock("@/components/clients/client-list", () => ({ ClientList: () => <div data-testid="rows" /> }));

describeListStates({
  screen: () => <ClientsScreen actor={AuthActor.Admin} />,
  forbidden: () => <ClientsScreen actor={AuthActor.Manager} />,
  harness,
  states: { ...enDictionary.clients.states },
});
