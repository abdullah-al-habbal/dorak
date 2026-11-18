// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PayoutActionDialog } from "@/components/admin-payouts/payout-action-dialog";
import { ApiErrorCode } from "@/enums/access/api-error-code.enum";
import { PayoutAction } from "@/enums/money/payout-action.enum";
import { enDictionary } from "@/locales/en/index.constant";
import { ApiClientError } from "@/services/api/core/api-client-error";
import { renderInApp } from "@tests/helpers/list-screen.helper";
import type { AdminPayout } from "@/types/earnings/admin-payout.type";

const mutateAsync = vi.hoisted(() => vi.fn());
vi.mock("@/hooks/earnings/use-transition-payout", () => ({ useTransitionPayout: () => ({ mutateAsync, isPending: false }) }));

const t = enDictionary.adminPayouts.dialog;
const payout = { id: "po1", brand: { name: "Cuts Co" }, total_amount_minor: 12500, currency: { code: "USD" } } as unknown as AdminPayout;

function open(action: PayoutAction, onClose = vi.fn()) {
  renderInApp(<PayoutActionDialog payout={payout} action={action} onClose={onClose} />);
  return onClose;
}

describe("PayoutActionDialog", () => {
  beforeEach(() => {
    mutateAsync.mockReset();
    mutateAsync.mockResolvedValue(undefined);
  });

  it("names the brand and the amount being acted on", () => {
    open(PayoutAction.Approve);
    expect(screen.getByText(/Cuts Co/)).toBeInTheDocument();
    expect(screen.getByText(/125/)).toBeInTheDocument();
  });

  it("approves with no reference or notes", async () => {
    const onClose = open(PayoutAction.Approve);
    await userEvent.click(screen.getByRole("button", { name: t.approve.confirm }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(mutateAsync).toHaveBeenCalledWith({ id: "po1", action: PayoutAction.Approve, external_reference: undefined, notes: undefined });
  });

  it("does not ask for a transfer reference unless marking paid", () => {
    open(PayoutAction.Approve);
    expect(screen.queryByLabelText(new RegExp(`^${t.reference}`))).not.toBeInTheDocument();
  });

  it("sends the trimmed reference and notes when marking paid", async () => {
    open(PayoutAction.MarkPaid);
    await userEvent.type(screen.getByLabelText(new RegExp(`^${t.reference}`)), " TR-991 ");
    await userEvent.type(screen.getByLabelText(new RegExp(`^${t.notes}`)), " wired ");
    await userEvent.click(screen.getByRole("button", { name: t["mark-paid"].confirm }));
    await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith({ id: "po1", action: PayoutAction.MarkPaid, external_reference: "TR-991", notes: "wired" }));
  });

  it("explains a conflict, and shows the generic message for other failures", async () => {
    mutateAsync.mockImplementationOnce(async () => {
      throw new ApiClientError({ status: 409, code: ApiErrorCode.Conflict, message: "" });
    });
    open(PayoutAction.Cancel);
    await userEvent.click(screen.getByRole("button", { name: t.cancel.confirm }));
    expect(await screen.findByText(t.errors.conflict)).toBeInTheDocument();
    mutateAsync.mockImplementationOnce(async () => {
      throw new Error("boom");
    });
    await userEvent.click(screen.getByRole("button", { name: t.cancel.confirm }));
    expect(await screen.findByText(t.errors.generic)).toBeInTheDocument();
  });
});
