// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { InviteBarberDialog } from "@/components/invitations/invite-barber-dialog";
import { I18nContext } from "@/components/providers/i18n-context";
import { ApiErrorCode } from "@/enums/access/api-error-code.enum";
import { Locale } from "@/enums/access/locale.enum";
import { TextDirection } from "@/enums/access/text-direction.enum";
import { enDictionary } from "@/locales/en/index.constant";
import { ApiClientError } from "@/services/api/core/api-client-error";

const invite = vi.fn();
const inviteByContact = vi.fn();

vi.mock("@/hooks/stylists/invite/use-invite-barber", () => ({ useInviteBarber: () => ({ mutateAsync: invite, isPending: false }) }));
vi.mock("@/hooks/stylists/invite/use-invite-barber-by-contact", () => ({ useInviteBarberByContact: () => ({ mutateAsync: inviteByContact, isPending: false }) }));
vi.mock("@/hooks/stylists/invite/use-barber-lookup", () => ({ useBarberLookup: () => ({ data: undefined, isError: false }) }));

const t = enDictionary.invitations.inviteDialog;

function renderDialog(barber?: { id: string; name: string }) {
  const onClose = vi.fn();
  render(
    <I18nContext.Provider value={{ locale: Locale.En, direction: TextDirection.Ltr, dictionary: enDictionary }}>
      <InviteBarberDialog branchId="br1" barber={barber} onClose={onClose} />
    </I18nContext.Provider>,
  );
  return onClose;
}

describe("InviteBarberDialog", () => {
  beforeEach(() => {
    invite.mockReset();
    inviteByContact.mockReset();
  });

  it("asks to choose a barber when nothing is chosen and sends nothing", async () => {
    renderDialog();
    await userEvent.click(screen.getByRole("button", { name: t.submit }));
    expect(await screen.findByText(t.pick)).toBeInTheDocument();
    expect(invite).not.toHaveBeenCalled();
    expect(inviteByContact).not.toHaveBeenCalled();
  });

  it("rejects a commission above 100 under its field", async () => {
    renderDialog({ id: "b1", name: "Omar" });
    await userEvent.type(screen.getByLabelText(new RegExp(`^${t.commission.replace(/[()]/g, "\\$&")}`)), "101");
    await userEvent.click(screen.getByRole("button", { name: t.submit }));
    expect(await screen.findByText(t.commissionRange)).toBeInTheDocument();
    expect(invite).not.toHaveBeenCalled();
  });

  it("invites a given barber by id with the commission as a number", async () => {
    const onClose = renderDialog({ id: "b1", name: "Omar" });
    await userEvent.type(screen.getByLabelText(new RegExp(`^${t.commission.replace(/[()]/g, "\\$&")}`)), "15");
    await userEvent.click(screen.getByRole("button", { name: t.submit }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(invite).toHaveBeenCalledWith({ branchId: "br1", payload: { barber_id: "b1", commission_percent: 15 } });
  });

  it("shows the already-affiliated message on a 409 and stays open", async () => {
    invite.mockImplementation(() => Promise.reject(new ApiClientError({ status: 409, code: ApiErrorCode.Conflict, message: "" })));
    const onClose = renderDialog({ id: "b1", name: "Omar" });
    await userEvent.click(screen.getByRole("button", { name: t.submit }));
    expect(await screen.findByText(t.alreadyAffiliated)).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });
});
