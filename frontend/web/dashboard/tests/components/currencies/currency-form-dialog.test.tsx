// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CurrencyFormDialog } from "@/components/currencies/currency-form-dialog";
import { ApiErrorCode } from "@/enums/access/api-error-code.enum";
import { enDictionary } from "@/locales/en/index.constant";
import { ApiClientError } from "@/services/api/core/api-client-error";
import { labelStart } from "@tests/helpers/label.helper";
import { renderInApp } from "@tests/helpers/list-screen.helper";
import type { AdminCurrency } from "@/types/platform/currency-admin.type";

const mutateAsync = vi.hoisted(() => vi.fn());
vi.mock("@/hooks/platform/currencies/use-save-currency", () => ({ useSaveCurrency: () => ({ mutateAsync, isPending: false }) }));

const t = enDictionary.currencies.form;
const label = labelStart;

async function fill(): Promise<void> {
  await userEvent.type(screen.getByLabelText(label(t.code)), "eur9");
  await userEvent.type(screen.getByLabelText(label(t.nameEn)), " Euro ");
  await userEvent.type(screen.getByLabelText(label(t.nameAr)), "يورو");
  await userEvent.type(screen.getByLabelText(label(t.symbol)), "€");
}

describe("CurrencyFormDialog", () => {
  beforeEach(() => {
    mutateAsync.mockReset();
    mutateAsync.mockResolvedValue(undefined);
  });

  it("flags every missing field and sends nothing", async () => {
    renderInApp(<CurrencyFormDialog onClose={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: t.create }));
    expect((await screen.findAllByText(t.required)).length).toBe(4);
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("keeps the code to capital letters and creates the currency with the code", async () => {
    const onClose = vi.fn();
    renderInApp(<CurrencyFormDialog onClose={onClose} />);
    await fill();
    expect(screen.getByLabelText(label(t.code))).toHaveValue("EUR");
    await userEvent.click(screen.getByRole("button", { name: t.create }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(mutateAsync).toHaveBeenCalledWith({ id: undefined, payload: { code: "EUR", name: { en: "Euro", ar: "يورو" }, symbol: "€" } });
  });

  it("edits without letting the code change, and does not send it", async () => {
    const currency = { id: "c1", code: "USD", name: { en: "Dollar", ar: "دولار" }, symbol: "$" } as unknown as AdminCurrency;
    const onClose = vi.fn();
    renderInApp(<CurrencyFormDialog currency={currency} onClose={onClose} />);
    expect(screen.getByLabelText(label(t.code))).toHaveAttribute("readonly");
    fireEvent.change(screen.getByLabelText(label(t.symbol)), { target: { value: "US$" } });
    await userEvent.click(screen.getByRole("button", { name: t.save }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(mutateAsync).toHaveBeenCalledWith({ id: "c1", payload: { name: { en: "Dollar", ar: "دولار" }, symbol: "US$" } });
  });

  it("puts a backend field error under its field and keeps the dialog open", async () => {
    mutateAsync.mockImplementation(async () => {
      throw new ApiClientError({ status: 422, code: ApiErrorCode.InvalidRequest, message: "", fields: { code: ["That code exists."] } });
    });
    const onClose = vi.fn();
    renderInApp(<CurrencyFormDialog onClose={onClose} />);
    await fill();
    await userEvent.click(screen.getByRole("button", { name: t.create }));
    expect(await screen.findByText("That code exists.")).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("shows the generic failure when the server errors", async () => {
    mutateAsync.mockImplementation(async () => {
      throw new ApiClientError({ status: 500, code: ApiErrorCode.Server, message: "" });
    });
    renderInApp(<CurrencyFormDialog onClose={vi.fn()} />);
    await fill();
    await userEvent.click(screen.getByRole("button", { name: t.create }));
    expect(await screen.findByText(t.failed)).toBeInTheDocument();
  });
});
