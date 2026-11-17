// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { OverlayHost } from "@/components/overlays/overlay-host";
import { I18nContext } from "@/components/providers/i18n-context";
import { Locale } from "@/enums/access/locale.enum";
import { TextDirection } from "@/enums/access/text-direction.enum";
import { OverlayKind } from "@/enums/ui/overlay-kind.enum";
import { enDictionary } from "@/locales/en/index.constant";

vi.mock("@/hooks/platform/settings/use-website-content", () => ({
  useSaveTestimonial: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

function renderHost(request: Parameters<typeof OverlayHost>[0]["request"]) {
  return render(
    <I18nContext.Provider value={{ locale: Locale.En, direction: TextDirection.Ltr, dictionary: enDictionary }}>
      <OverlayHost request={request} onClose={vi.fn()} />
    </I18nContext.Provider>,
  );
}

describe("OverlayHost", () => {
  it("renders nothing without a request", () => {
    const { container } = renderHost(null);
    expect(container).toBeEmptyDOMElement();
  });

  it("loads a dialog on first open and shows it", async () => {
    renderHost({ kind: OverlayKind.TestimonialForm, sections: [] });
    expect(await screen.findByRole("dialog", {}, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getByText(enDictionary.content.testimonialForm.createTitle)).toBeInTheDocument();
  });
});
