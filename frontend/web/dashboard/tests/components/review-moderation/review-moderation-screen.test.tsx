// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { vi } from "vitest";

import { ReviewModerationScreen } from "@/components/review-moderation/review-moderation-screen";
import { enDictionary } from "@/locales/en/index.constant";
import { describeListStates } from "@tests/helpers/list-screen.helper";
import type { ListHarness } from "@tests/helpers/list-screen.helper";

const harness = vi.hoisted<ListHarness>(() => ({ query: {}, search: "", refetch: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }), usePathname: () => "/dashboard/x", useSearchParams: () => new URLSearchParams(harness.search) }));
vi.mock("@/hooks/clients/reviews/use-review-moderation", () => ({ useReviewModeration: () => harness.query }));
vi.mock("@/hooks/core/state/use-overlay", () => ({ useOverlay: () => ({ open: vi.fn(), close: vi.fn() }) }));
vi.mock("@/components/review-moderation/review-moderation-list", () => ({ ReviewModerationList: () => <div data-testid="rows" /> }));

describeListStates({
  screen: () => <ReviewModerationScreen />,
  harness,
  filteredSearch: "status=resolved",
  states: { ...enDictionary.reviewModeration.states },
});
