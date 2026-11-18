// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ExchangeRateDialog } from "@/components/currencies/exchange-rate-dialog";
import { enDictionary } from "@/locales/en/index.constant";
import { labelStart } from "@tests/helpers/label.helper";
import { renderInApp } from "@tests/helpers/list-screen.helper";

const mutateAsync = vi.hoisted(() => vi.fn());
vi.mock("@/hooks/platform/currencies/use-save-exchange-rate", () => ({ useSaveExchangeRate: () => ({ mutateAsync, isPending: false }) }));
vi.mock("@/hooks/platform/currencies/use-admin-currencies", () => ({
  useAdminCurrencies: () => ({ data: [{ code: "USD", is_active: true }, { code: "EUR", is_active: true }, { code: "OLD", is_active: false }] }),
}));

const t = enDictionary.currencies.rateForm;
const label = labelStart;

describe("ExchangeRateDialog", () => {
  beforeEach(() => {
    mutateAsync.mockReset();
    mutateAsync.mockResolvedValue(undefined);
  });

  it("offers only active currencies and defaults to two different ones", () => {
    renderInApp(<ExchangeRateDialog onClose={vi.fn()} />);
    const from = screen.getByLabelText(label(t.from));
    expect(Array.from(from.querySelectorAll("option")).map((option) => option.value)).toEqual(["USD", "EUR"]);
    expect(from).toHaveValue("USD");
    expect(screen.getByLabelText(label(t.to))).toHaveValue("EUR");
  });

  it("rejects a rate that is zero or malformed", async () => {
    renderInApp(<ExchangeRateDialog onClose={vi.fn()} />);
    await userEvent.type(screen.getByLabelText(label(t.rate)), "0");
    await userEvent.click(screen.getByRole("button", { name: t.save }));
    expect(await screen.findByText(t.invalidRate)).toBeInTheDocument();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("refuses the same currency on both sides", async () => {
    renderInApp(<ExchangeRateDialog onClose={vi.fn()} />);
    await userEvent.selectOptions(screen.getByLabelText(label(t.to)), "USD");
    await userEvent.type(screen.getByLabelText(label(t.rate)), "1.1");
    await userEvent.click(screen.getByRole("button", { name: t.save }));
    expect(await screen.findByText(t.samePair)).toBeInTheDocument();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("saves a valid rate for the chosen pair and closes", async () => {
    const onClose = vi.fn();
    renderInApp(<ExchangeRateDialog onClose={onClose} />);
    await userEvent.type(screen.getByLabelText(label(t.rate)), "1.0825");
    await userEvent.click(screen.getByRole("button", { name: t.save }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(mutateAsync).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(mutateAsync.mock.calls[0][0])).toContain("USD");
    expect(JSON.stringify(mutateAsync.mock.calls[0][0])).toContain("1.0825");
  });
});
