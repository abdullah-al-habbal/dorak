// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CurrenciesScreen } from "@/components/currencies/currencies-screen";
import { AuthActor } from "@/enums/access/auth-actor.enum";
import { OverlayKind } from "@/enums/ui/overlay-kind.enum";
import { enDictionary } from "@/locales/en/index.constant";
import { renderInApp } from "@tests/helpers/list-screen.helper";

const state = vi.hoisted(() => ({ query: {} as Record<string, unknown>, refetch: vi.fn(), open: vi.fn(), toggle: vi.fn() }));

vi.mock("@/hooks/platform/currencies/use-admin-currencies", () => ({ useAdminCurrencies: () => state.query }));
vi.mock("@/hooks/platform/currencies/use-set-currency-active", () => ({ useSetCurrencyActive: () => ({ mutate: state.toggle, mutateAsync: vi.fn(), isPending: false }) }));
vi.mock("@/hooks/core/state/use-overlay", () => ({ useOverlay: () => ({ open: state.open, close: vi.fn() }) }));
vi.mock("@/components/currencies/rates-panel", () => ({ RatesPanel: () => <div data-testid="rates" /> }));
vi.mock("@/components/currencies/currency-row", () => ({
  CurrencyRow: ({ currency, onToggle }: { currency: { id: string; code: string; is_active: boolean }; onToggle: (c: unknown, active: boolean) => void }) => (
    <li>
      <span>{currency.code}</span>
      <button type="button" onClick={() => onToggle(currency, !currency.is_active)}>{`toggle ${currency.code}`}</button>
    </li>
  ),
}));

const t = enDictionary.currencies;

function show(fields: Record<string, unknown>, actor: AuthActor = AuthActor.Admin): void {
  state.query = { isPending: false, isError: false, isFetching: false, data: undefined, refetch: state.refetch, ...fields };
  renderInApp(<CurrenciesScreen actor={actor} />);
}

describe("CurrenciesScreen", () => {
  beforeEach(() => {
    state.refetch.mockReset();
    state.open.mockReset();
    state.toggle.mockReset();
  });

  it("is for platform admins only", () => {
    show({ isPending: true }, AuthActor.Manager);
    expect(screen.getByText(t.states.forbiddenTitle)).toBeInTheDocument();
  });

  it("shows a loading skeleton while the list loads", () => {
    show({ isPending: true });
    expect(screen.getByRole("status", { name: enDictionary.common.loading })).toBeInTheDocument();
  });

  it("shows the error with a retry", async () => {
    show({ isError: true });
    expect(screen.getByRole("alert")).toHaveTextContent(t.states.errorTitle);
    await userEvent.click(screen.getByRole("button", { name: enDictionary.common.retry }));
    expect(state.refetch).toHaveBeenCalledTimes(1);
  });

  it("shows the empty state when no currency exists", () => {
    show({ data: [] });
    expect(screen.getByText(t.states.emptyTitle)).toBeInTheDocument();
  });

  it("opens the add form from the add button", async () => {
    show({ data: [] });
    await userEvent.click(screen.getByRole("button", { name: t.add }));
    expect(state.open).toHaveBeenCalledWith({ kind: OverlayKind.CurrencyForm });
  });

  it("switches an inactive currency on straight away", async () => {
    show({ data: [{ id: "c1", code: "EUR", is_active: false }] });
    await userEvent.click(screen.getByRole("button", { name: "toggle EUR" }));
    expect(state.toggle).toHaveBeenCalledWith({ id: "c1", active: true });
    expect(state.open).not.toHaveBeenCalled();
  });

  it("asks for confirmation before retiring an active currency", async () => {
    show({ data: [{ id: "c1", code: "EUR", is_active: true }] });
    await userEvent.click(screen.getByRole("button", { name: "toggle EUR" }));
    expect(state.toggle).not.toHaveBeenCalled();
    expect(state.open).toHaveBeenCalledWith(expect.objectContaining({ kind: OverlayKind.Confirm, title: t.confirm.retireTitle, destructive: true }));
  });

  it("switches to the rates tab", async () => {
    show({ data: [] });
    await userEvent.click(screen.getByRole("button", { name: t.tabs.rates }));
    expect(screen.getByTestId("rates")).toBeInTheDocument();
  });
});
