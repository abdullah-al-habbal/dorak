// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ConfirmOverlay } from "@/components/overlays/confirm-overlay";
import { I18nContext } from "@/components/providers/i18n-context";
import { Locale } from "@/enums/access/locale.enum";
import { TextDirection } from "@/enums/access/text-direction.enum";
import { OverlayKind } from "@/enums/ui/overlay-kind.enum";
import type { ConfirmOverlayRequest } from "@/interfaces/ui/shell/confirm-overlay-request.interface";
import { enDictionary } from "@/locales/en/index.constant";

function renderConfirm(request: Partial<ConfirmOverlayRequest>, onClose = vi.fn()) {
  const full: ConfirmOverlayRequest = { kind: OverlayKind.Confirm, title: "Deactivate?", description: "Body", confirmLabel: "Deactivate", onConfirm: vi.fn(), ...request };
  render(
    <I18nContext.Provider value={{ locale: Locale.En, direction: TextDirection.Ltr, dictionary: enDictionary }}>
      <ConfirmOverlay request={full} onClose={onClose} />
    </I18nContext.Provider>,
  );
  return { full, onClose };
}

describe("ConfirmOverlay reason", () => {
  it("has no reason box unless asked", () => {
    renderConfirm({});
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("confirms without a reason when the box is left empty", async () => {
    const { full } = renderConfirm({ reason: { label: "Reason" } });
    await userEvent.click(screen.getByRole("button", { name: "Deactivate" }));
    expect(full.onConfirm).toHaveBeenCalledWith(undefined);
  });

  it("passes the trimmed reason to the caller", async () => {
    const { full } = renderConfirm({ reason: { label: "Reason" } });
    await userEvent.type(screen.getByRole("textbox", { name: "Reason" }), "  Left the shop.  ");
    await userEvent.click(screen.getByRole("button", { name: "Deactivate" }));
    expect(full.onConfirm).toHaveBeenCalledWith("Left the shop.");
  });

  it("blocks a reason that is too short", async () => {
    const { full } = renderConfirm({ reason: { label: "Reason" } });
    await userEvent.type(screen.getByRole("textbox", { name: "Reason" }), "ab");
    expect(screen.getByRole("alert")).toHaveTextContent("at least 3");
    expect(screen.getByRole("button", { name: "Deactivate" })).toBeDisabled();
    expect(full.onConfirm).not.toHaveBeenCalled();
  });
});
