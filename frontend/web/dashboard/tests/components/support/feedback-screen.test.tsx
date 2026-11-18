// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { vi } from "vitest";

import { FeedbackScreen } from "@/components/support/feedback-screen";
import { AuthActor } from "@/enums/access/auth-actor.enum";
import { enDictionary } from "@/locales/en/index.constant";
import { describeListStates } from "@tests/helpers/list-screen.helper";
import type { ListHarness } from "@tests/helpers/list-screen.helper";

const harness = vi.hoisted<ListHarness>(() => ({ query: {}, search: "", refetch: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }), usePathname: () => "/dashboard/admin/support", useSearchParams: () => new URLSearchParams(harness.search) }));
vi.mock("@/hooks/support/use-feedback-reports", () => ({ useFeedbackReports: () => harness.query }));
vi.mock("@/hooks/core/state/use-overlay", () => ({ useOverlay: () => ({ open: vi.fn(), close: vi.fn() }) }));
vi.mock("@/components/support/feedback-toolbar", () => ({ FeedbackToolbar: () => null }));
vi.mock("@/components/support/feedback-list", () => ({ FeedbackList: () => <div data-testid="rows" /> }));

describeListStates({
  screen: () => <FeedbackScreen actor={AuthActor.Admin} />,
  forbidden: () => <FeedbackScreen actor={AuthActor.Manager} />,
  harness,
  states: { ...enDictionary.support.states },
});
