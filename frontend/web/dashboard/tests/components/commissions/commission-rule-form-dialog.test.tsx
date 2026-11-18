// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CommissionRuleFormDialog } from "@/components/commissions/commission-rule-form-dialog";
import { CommissionScope, CommissionType } from "@/enums/money/commission.enum";
import { OverlayKind } from "@/enums/ui/overlay-kind.enum";
import { enDictionary } from "@/locales/en/index.constant";
import { labelStart } from "@tests/helpers/label.helper";
import { renderInApp } from "@tests/helpers/list-screen.helper";
import type { CommissionRule } from "@/types/earnings/commission.type";

const save = vi.hoisted(() => vi.fn());
const remove = vi.hoisted(() => vi.fn());
const overlay = vi.hoisted(() => ({ open: vi.fn(), close: vi.fn() }));

vi.mock("@/hooks/earnings/use-commissions", () => ({
  useSaveCommissionRule: () => ({ mutateAsync: save, isPending: false }),
  useDeleteCommissionRule: () => ({ mutateAsync: remove, isPending: false }),
}));
vi.mock("@/hooks/brands/owner/use-brand-options", () => ({ useBrandOptions: () => ({ data: [{ id: "b1", name: "Cuts Co" }] }) }));
vi.mock("@/hooks/branches/use-branch-options", () => ({ useBranchOptions: () => ({ data: [{ id: "br1", name: "Downtown" }] }) }));
vi.mock("@/hooks/platform/currencies/use-currencies", () => ({ useCurrencies: () => ({ data: [{ code: "USD" }, { code: "EUR" }] }) }));
vi.mock("@/hooks/core/state/use-overlay", () => ({ useOverlay: () => overlay }));

const t = enDictionary.commissions;
const f = t.form;

describe("CommissionRuleFormDialog", () => {
  beforeEach(() => {
    save.mockReset();
    save.mockResolvedValue(undefined);
    remove.mockReset();
    overlay.open.mockReset();
  });

  it("rejects a percent above 100 under its field", async () => {
    renderInApp(<CommissionRuleFormDialog onClose={vi.fn()} />);
    await userEvent.type(screen.getByLabelText(labelStart(f.percent)), "150");
    await userEvent.click(screen.getByRole("button", { name: f.create }));
    expect(await screen.findByText(f.invalidPercent)).toBeInTheDocument();
    expect(save).not.toHaveBeenCalled();
  });

  it("creates a global percent rule as basis points", async () => {
    const onClose = vi.fn();
    renderInApp(<CommissionRuleFormDialog onClose={onClose} />);
    await userEvent.type(screen.getByLabelText(labelStart(f.percent)), "12.5");
    await userEvent.click(screen.getByRole("button", { name: f.create }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(save).toHaveBeenCalledWith({
      id: undefined,
      payload: expect.objectContaining({ scope: CommissionScope.Global, type: CommissionType.Percent, value_bps: 1250, is_active: true, notes: null }),
    });
  });

  it("offers the brands when the rule applies to a brand, and sends the chosen one", async () => {
    renderInApp(<CommissionRuleFormDialog onClose={vi.fn()} />);
    await userEvent.selectOptions(screen.getByLabelText(labelStart(f.scope)), CommissionScope.Brand);
    expect(screen.getByRole("option", { name: "Cuts Co" })).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText(labelStart(f.percent)), "10");
    await userEvent.click(screen.getByRole("button", { name: f.create }));
    await waitFor(() => expect(save).toHaveBeenCalled());
    expect(save.mock.calls[0][0].payload).toEqual(expect.objectContaining({ scope: CommissionScope.Brand, scope_id: "b1", value_bps: 1000 }));
  });

  it("creates a flat rule in minor units with a currency", async () => {
    renderInApp(<CommissionRuleFormDialog onClose={vi.fn()} />);
    await userEvent.selectOptions(screen.getByLabelText(labelStart(f.type)), CommissionType.Flat);
    await userEvent.type(screen.getByLabelText(labelStart(f.amount)), "2.50");
    await userEvent.click(screen.getByRole("button", { name: f.create }));
    await waitFor(() => expect(save).toHaveBeenCalled());
    expect(save.mock.calls[0][0].payload).toEqual(expect.objectContaining({ type: CommissionType.Flat, value_amount_minor: 250, currency_code: "USD" }));
  });

  it("offers delete only when editing, and asks for confirmation through the overlay", async () => {
    const rule = { id: "r1", scope: CommissionScope.Global, scope_id: null, type: CommissionType.Percent, value_bps: 500, is_active: true, notes: null } as unknown as CommissionRule;
    const onClose = vi.fn();
    renderInApp(<CommissionRuleFormDialog rule={rule} onClose={onClose} />);
    expect(screen.getByLabelText(labelStart(f.percent))).toHaveValue("5");
    await userEvent.click(screen.getByRole("button", { name: f.delete }));
    expect(onClose).toHaveBeenCalled();
    expect(overlay.open).toHaveBeenCalledWith(expect.objectContaining({ kind: OverlayKind.Confirm, title: t.confirm.deleteTitle, destructive: true }));
    expect(remove).not.toHaveBeenCalled();
  });

  it("does not offer delete for a new rule", () => {
    renderInApp(<CommissionRuleFormDialog onClose={vi.fn()} />);
    expect(screen.queryByRole("button", { name: f.delete })).not.toBeInTheDocument();
  });
});
