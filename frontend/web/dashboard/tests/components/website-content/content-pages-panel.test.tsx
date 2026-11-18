// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ContentPagesPanel } from "@/components/website-content/content-pages-panel";
import { I18nContext } from "@/components/providers/i18n-context";
import { Locale } from "@/enums/access/locale.enum";
import { TextDirection } from "@/enums/access/text-direction.enum";
import { UniverseVisibility } from "@/enums/people/universe-visibility.enum";
import { enDictionary } from "@/locales/en/index.constant";

const mutate = vi.fn();
const query = vi.hoisted(() => ({ current: {} as Record<string, unknown> }));

vi.mock("@/hooks/platform/settings/use-website-content", () => ({
  useWebsiteContent: () => query.current,
  useSetContentPagePublished: () => ({ mutate, isPending: false }),
}));
vi.mock("@/hooks/core/state/use-overlay", () => ({ useOverlay: () => ({ open: vi.fn(), close: vi.fn() }) }));

const t = enDictionary.content.pages;
const section = (ar: Record<string, unknown>) => ({ id: "s1", page_id: "p1", section_type: "legal_text", body: { en: { paragraphs: ["a"] }, ar }, sort_order: 0, universe_visibility: UniverseVisibility.All });
const page = (overrides: Record<string, unknown>) => ({ id: "p1", slug: "privacy", title: { en: "Privacy Policy", ar: "سياسة الخصوصية" }, published_at: null, sections: [section({ paragraphs: ["ب"] })], ...overrides });

function renderPanel(pages: unknown[]) {
  query.current = { data: { pages, testimonials: [] }, isPending: false, isError: false, isFetching: false, refetch: vi.fn() };
  render(
    <I18nContext.Provider value={{ locale: Locale.En, direction: TextDirection.Ltr, dictionary: enDictionary }}>
      <ContentPagesPanel />
    </I18nContext.Provider>,
  );
}

describe("ContentPagesPanel publishing", () => {
  beforeEach(() => mutate.mockReset());

  it("shows a draft and publishes it from the switch", async () => {
    renderPanel([page({})]);

    expect(screen.getByText(t.draft)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("switch", { name: t.publishAria.replace("{page}", "Privacy Policy") }));

    expect(mutate).toHaveBeenCalledWith({ id: "p1", published: true });
  });

  it("unpublishes a published page", async () => {
    renderPanel([page({ published_at: "2026-11-18T10:00:00+00:00" })]);

    expect(screen.getByText(t.published)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("switch", { name: t.unpublishAria.replace("{page}", "Privacy Policy") }));

    expect(mutate).toHaveBeenCalledWith({ id: "p1", published: false });
  });

  it("blocks publishing and names the missing language", () => {
    renderPanel([page({ sections: [section({})] })]);

    expect(screen.getByRole("switch", { name: t.publishAria.replace("{page}", "Privacy Policy") })).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByText(t.incomplete.replace("{languages}", t.languageNames.ar))).toBeInTheDocument();
  });
});
