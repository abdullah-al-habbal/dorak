// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";

import { BarberRejectDialog } from "@/components/barber-approvals/barber-reject-dialog";
import { ApiErrorCode } from "@/enums/access/api-error-code.enum";
import { enDictionary } from "@/locales/en/index.constant";
import { ApiClientError } from "@/services/api/core/api-client-error";
import { renderInApp } from "@tests/helpers/list-screen.helper";
import { describeReasonDialog } from "@tests/helpers/reason-dialog.helper";
import type { BarberApproval } from "@/types/stylists/barber-approval.type";

const mutateAsync = vi.hoisted(() => vi.fn());
vi.mock("@/hooks/stylists/approvals/use-reject-barber", () => ({ useRejectBarber: () => ({ mutateAsync, isPending: false }) }));

const t = enDictionary.barberApprovals.rejectDialog;
const barber = { id: "bb1", name: "Omar" } as unknown as BarberApproval;

describeReasonDialog({
  dialog: (onClose) => <BarberRejectDialog barber={barber} onClose={onClose} />,
  mutate: mutateAsync,
  reasonLabel: t.reason,
  submitLabel: t.confirm,
  tooShort: t.reasonRequired,
  failed: t.generic,
  expectedArgs: (reason) => ({ id: "bb1", reason }),
  cancelLabel: t.back,
});

it("explains a conflict when someone already reviewed the barber", async () => {
  mutateAsync.mockReset();
  mutateAsync.mockImplementation(async () => {
    throw new ApiClientError({ status: 409, code: ApiErrorCode.Conflict, message: "" });
  });
  renderInApp(<BarberRejectDialog barber={barber} onClose={vi.fn()} />);
  await userEvent.type(screen.getByLabelText(/^Reason/), "Not a real barber account");
  await userEvent.click(screen.getByRole("button", { name: t.confirm }));
  expect(await screen.findByText(t.conflict)).toBeInTheDocument();
});
