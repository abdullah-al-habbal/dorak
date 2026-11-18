import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import type { ReactElement } from "react";

import { enDictionary } from "@/locales/en/index.constant";
import { renderInApp } from "@tests/helpers/list-screen.helper";

const VALID_REASON = "Because it breaks the platform rules";

interface ReasonDialogCase {
  /** Renders the dialog; `onClose` must be wired to its close prop. */
  dialog: (onClose: () => void) => ReactElement;
  /** The mutation the dialog awaits. */
  mutate: Mock;
  /** The reason field's label text (the hint after it is ignored). */
  reasonLabel: string;
  submitLabel: string;
  /** The message shown when the reason is too short. */
  tooShort: string;
  /** The message shown when the mutation fails. */
  failed: string;
  /** What the mutation receives for `VALID_REASON`, trimmed. */
  expectedArgs: (reason: string) => unknown;
  /** The cancel button's label; defaults to the shared one. */
  cancelLabel?: string;
}

function startsWith(text: string): RegExp {
  return new RegExp(`^${text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);
}

/** The behaviour every reason dialog shares: a required reason, a trimmed submit, an inline failure and a cancel that closes. */
export function describeReasonDialog(config: ReasonDialogCase): void {
  const { dialog, mutate, reasonLabel, submitLabel, tooShort, failed, expectedArgs, cancelLabel = enDictionary.common.cancel } = config;

  describe("reason dialog", () => {
    beforeEach(() => {
      mutate.mockReset();
      mutate.mockResolvedValue(undefined);
    });

    it("asks for a reason and sends nothing while it is too short", async () => {
      const onClose = vi.fn();
      renderInApp(dialog(onClose));
      await userEvent.type(screen.getByLabelText(startsWith(reasonLabel)), "no");
      await userEvent.click(screen.getByRole("button", { name: submitLabel }));
      expect(await screen.findByText(tooShort)).toBeInTheDocument();
      expect(mutate).not.toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
    });

    it("sends the trimmed reason and closes", async () => {
      const onClose = vi.fn();
      renderInApp(dialog(onClose));
      await userEvent.type(screen.getByLabelText(startsWith(reasonLabel)), `  ${VALID_REASON}  `);
      await userEvent.click(screen.getByRole("button", { name: submitLabel }));
      await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
      expect(mutate).toHaveBeenCalledWith(expectedArgs(VALID_REASON));
    });

    it("shows the failure inline and stays open", async () => {
      mutate.mockImplementation(async () => {
        throw new Error("boom");
      });
      const onClose = vi.fn();
      renderInApp(dialog(onClose));
      await userEvent.type(screen.getByLabelText(startsWith(reasonLabel)), VALID_REASON);
      await userEvent.click(screen.getByRole("button", { name: submitLabel }));
      expect(await screen.findByText(failed)).toBeInTheDocument();
      expect(onClose).not.toHaveBeenCalled();
    });

    it("closes without sending when cancelled", async () => {
      const onClose = vi.fn();
      renderInApp(dialog(onClose));
      await userEvent.click(screen.getByRole("button", { name: cancelLabel }));
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(mutate).not.toHaveBeenCalled();
    });
  });
}
