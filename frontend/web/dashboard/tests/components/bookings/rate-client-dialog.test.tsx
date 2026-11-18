// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RateClientDialog } from "@/components/bookings/dialogs/rate-client-dialog";
import { I18nContext } from "@/components/providers/i18n-context";
import { ApiErrorCode } from "@/enums/access/api-error-code.enum";
import { Locale } from "@/enums/access/locale.enum";
import { TextDirection } from "@/enums/access/text-direction.enum";
import { enDictionary } from "@/locales/en/index.constant";
import { ApiClientError } from "@/services/api/core/api-client-error";
import type { Booking } from "@/types/bookings/booking.type";

const mutateAsync = vi.fn();

vi.mock("@/hooks/clients/clients/use-rate-client", () => ({ useRateClient: () => ({ mutateAsync, isPending: false }) }));

const t = enDictionary.bookings.rateClient;
const booking = { id: "bk1", client: { name: "Sam" } } as unknown as Booking;

function renderDialog() {
  const onClose = vi.fn();
  render(
    <I18nContext.Provider value={{ locale: Locale.En, direction: TextDirection.Ltr, dictionary: enDictionary }}>
      <RateClientDialog booking={booking} onClose={onClose} />
    </I18nContext.Provider>,
  );
  return onClose;
}

describe("RateClientDialog", () => {
  beforeEach(() => {
    mutateAsync.mockReset();
  });

  it("asks for a rating when no star is chosen", async () => {
    renderDialog();
    await userEvent.click(screen.getByRole("button", { name: t.submit }));
    expect(await screen.findByText(t.ratingRequired)).toBeInTheDocument();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("sends the chosen stars and leaves a blank note out", async () => {
    const onClose = renderDialog();
    await userEvent.click(screen.getByRole("radio", { name: t.stars.replace("{count}", "4") }));
    await userEvent.click(screen.getByRole("button", { name: t.submit }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(mutateAsync).toHaveBeenCalledWith({ bookingId: "bk1", input: { rating: 4 } });
  });

  it("sends a trimmed note", async () => {
    renderDialog();
    await userEvent.click(screen.getByRole("radio", { name: t.stars.replace("{count}", "5") }));
    await userEvent.type(screen.getByLabelText(new RegExp(`^${t.note}`)), "  On time ");
    await userEvent.click(screen.getByRole("button", { name: t.submit }));
    await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith({ bookingId: "bk1", input: { rating: 5, body: "On time" } }));
  });

  it("shows 'already rated' on a 409 and stays open", async () => {
    mutateAsync.mockImplementation(async () => {
      throw new ApiClientError({ status: 409, code: ApiErrorCode.Conflict, message: "" });
    });
    const onClose = renderDialog();
    await userEvent.click(screen.getByRole("radio", { name: t.stars.replace("{count}", "3") }));
    await userEvent.click(screen.getByRole("button", { name: t.submit }));
    expect(await screen.findByText(t.alreadyRated)).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });
});
