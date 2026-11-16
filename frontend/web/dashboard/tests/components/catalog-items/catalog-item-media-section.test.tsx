// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CatalogItemMediaSection } from "@/components/catalog-items/attributes/catalog-item-media-section";
import { I18nContext } from "@/components/providers/i18n-context";
import { Locale } from "@/enums/access/locale.enum";
import { TextDirection } from "@/enums/access/text-direction.enum";
import { enDictionary } from "@/locales/en/index.constant";

const upload = vi.fn();
const remove = vi.fn();

vi.mock("@/hooks/services/catalog/use-catalog-item-media", () => ({
  useUploadCatalogItemMedia: () => ({ mutateAsync: upload, isPending: false }),
  useRemoveCatalogItemMedia: () => ({ mutateAsync: remove, isPending: false }),
}));

const first = { id: "m1", image_url: "https://cdn.test/a.png", alt_text: null, sort_order: 1 };

function renderSection() {
  render(
    <I18nContext.Provider value={{ locale: Locale.En, direction: TextDirection.Ltr, dictionary: enDictionary }}>
      <CatalogItemMediaSection itemId="i1" initial={[first]} />
    </I18nContext.Provider>,
  );
}

describe("CatalogItemMediaSection", () => {
  beforeEach(() => {
    upload.mockReset();
    remove.mockReset();
  });

  it("uploads a chosen image and shows it", async () => {
    upload.mockResolvedValue({ id: "m2", image_url: "https://cdn.test/b.png", alt_text: null, sort_order: 2 });
    renderSection();
    const file = new File(["x"], "b.png", { type: "image/png" });
    await userEvent.upload(screen.getByLabelText(/Add an image/), file);
    await waitFor(() => expect(upload).toHaveBeenCalledWith({ itemId: "i1", file }));
    await waitFor(() => expect(document.querySelectorAll("img")).toHaveLength(2));
  });

  it("refuses a file that is not an image without calling the API", async () => {
    renderSection();
    await userEvent.upload(screen.getByLabelText(/Add an image/), new File(["x"], "a.pdf", { type: "application/pdf" }), { applyAccept: false });
    expect(upload).not.toHaveBeenCalled();
    expect(await screen.findByText("Choose a JPEG, PNG or WebP image.")).toBeInTheDocument();
  });

  it("removes an image once the API confirms", async () => {
    remove.mockResolvedValue(undefined);
    renderSection();
    await userEvent.click(screen.getByRole("button", { name: "Remove image" }));
    await waitFor(() => expect(remove).toHaveBeenCalledWith({ itemId: "i1", mediaId: "m1" }));
    await waitFor(() => expect(document.querySelectorAll("img")).toHaveLength(0));
  });
});
