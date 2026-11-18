// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AccountBanDialog } from "@/components/common/account-ban-dialog";
import { enDictionary } from "@/locales/en/index.constant";
import { renderInApp } from "@tests/helpers/list-screen.helper";

const onSubmit = vi.fn();
const copy = enDictionary.clients.ban;

function open(onClose = vi.fn()) {
  renderInApp(<AccountBanDialog copy={copy} body="Sam" pending={false} onSubmit={onSubmit} onClose={onClose} />);
  return onClose;
}

describe("AccountBanDialog", () => {
  beforeEach(() => {
    onSubmit.mockReset();
    onSubmit.mockResolvedValue(undefined);
  });

  it("needs a reason before it bans", async () => {
    open();
    await userEvent.type(screen.getByLabelText(new RegExp(`^${copy.reason}`)), "x");
    await userEvent.click(screen.getByRole("button", { name: copy.confirm }));
    expect(await screen.findByText(copy.reasonRequired)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("bans permanently when no end date is given, with a trimmed reason", async () => {
    const onClose = open();
    await userEvent.type(screen.getByLabelText(new RegExp(`^${copy.reason}`)), "  Repeated no-shows  ");
    await userEvent.click(screen.getByRole("button", { name: copy.confirm }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(onSubmit).toHaveBeenCalledWith({ reason: "Repeated no-shows", expiresAt: undefined });
  });

  it("refuses an end date in the past", async () => {
    open();
    await userEvent.type(screen.getByLabelText(new RegExp(`^${copy.reason}`)), "Repeated no-shows");
    await userEvent.type(screen.getByLabelText(new RegExp(`^${copy.endsAt}`)), "2000-01-01T10:00");
    await userEvent.click(screen.getByRole("button", { name: copy.confirm }));
    expect(await screen.findByText(copy.endInPast)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("sends a future end date as an ISO time", async () => {
    open();
    await userEvent.type(screen.getByLabelText(new RegExp(`^${copy.reason}`)), "Repeated no-shows");
    await userEvent.type(screen.getByLabelText(new RegExp(`^${copy.endsAt}`)), "2999-01-01T10:00");
    await userEvent.click(screen.getByRole("button", { name: copy.confirm }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0].expiresAt).toBe(new Date("2999-01-01T10:00").toISOString());
  });

  it("shows the failure and stays open", async () => {
    onSubmit.mockImplementation(async () => {
      throw new Error("boom");
    });
    const onClose = open();
    await userEvent.type(screen.getByLabelText(new RegExp(`^${copy.reason}`)), "Repeated no-shows");
    await userEvent.click(screen.getByRole("button", { name: copy.confirm }));
    expect(await screen.findByText(copy.failed)).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });
});
