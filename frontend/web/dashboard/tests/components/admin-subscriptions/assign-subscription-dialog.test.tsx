// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AssignSubscriptionDialog } from "@/components/admin-subscriptions/assign-subscription-dialog";
import { ApiErrorCode } from "@/enums/access/api-error-code.enum";
import { enDictionary } from "@/locales/en/index.constant";
import { ApiClientError } from "@/services/api/core/api-client-error";
import { labelStart } from "@tests/helpers/label.helper";
import { renderInApp } from "@tests/helpers/list-screen.helper";

const mutateAsync = vi.hoisted(() => vi.fn());
const lists = vi.hoisted(() => ({
  brands: { isSuccess: true, isError: false, data: [{ id: "b1", name: "Cuts Co" }], refetch: vi.fn() } as Record<string, unknown>,
  plans: { isSuccess: true, isError: false, data: [{ id: "p1", name: "Pro" }], refetch: vi.fn() } as Record<string, unknown>,
}));

vi.mock("@/hooks/plans/subscriptions/use-assign-subscription", () => ({ useAssignSubscription: () => ({ mutateAsync, isPending: false }) }));
vi.mock("@/hooks/brands/owner/use-brand-options", () => ({ useBrandOptions: () => lists.brands }));
vi.mock("@/hooks/plans/use-plan-options", () => ({ usePlanOptions: () => lists.plans }));

const t = enDictionary.adminSubscriptions;
const d = t.assignDialog;

describe("AssignSubscriptionDialog", () => {
  beforeEach(() => {
    mutateAsync.mockReset();
    mutateAsync.mockResolvedValue(undefined);
    lists.brands = { isSuccess: true, isError: false, data: [{ id: "b1", name: "Cuts Co" }], refetch: vi.fn() };
    lists.plans = { isSuccess: true, isError: false, data: [{ id: "p1", name: "Pro" }], refetch: vi.fn() };
  });

  it("asks for a brand and a plan before assigning", async () => {
    renderInApp(<AssignSubscriptionDialog onClose={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: d.submit }));
    expect(await screen.findByText(d.validation.brand)).toBeInTheDocument();
    expect(screen.getByText(d.validation.plan)).toBeInTheDocument();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("assigns the chosen plan to the chosen brand and closes", async () => {
    const onClose = vi.fn();
    renderInApp(<AssignSubscriptionDialog onClose={onClose} />);
    await userEvent.selectOptions(screen.getByLabelText(labelStart(d.brand)), "b1");
    await userEvent.selectOptions(screen.getByLabelText(labelStart(d.plan)), "p1");
    await userEvent.click(screen.getByRole("button", { name: d.submit }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(mutateAsync).toHaveBeenCalledWith({ brand_id: "b1", plan_id: "p1" });
  });

  it("shows the backend's reason for a 422 and the generic copy otherwise", async () => {
    mutateAsync.mockImplementationOnce(async () => {
      throw new ApiClientError({ status: 422, code: ApiErrorCode.InvalidRequest, message: "That plan is inactive." });
    });
    renderInApp(<AssignSubscriptionDialog onClose={vi.fn()} />);
    await userEvent.selectOptions(screen.getByLabelText(labelStart(d.brand)), "b1");
    await userEvent.selectOptions(screen.getByLabelText(labelStart(d.plan)), "p1");
    await userEvent.click(screen.getByRole("button", { name: d.submit }));
    expect(await screen.findByText("That plan is inactive.")).toBeInTheDocument();
    mutateAsync.mockImplementationOnce(async () => {
      throw new ApiClientError({ status: 500, code: ApiErrorCode.Server, message: "" });
    });
    await userEvent.click(screen.getByRole("button", { name: d.submit }));
    expect(await screen.findByText(d.errors.generic)).toBeInTheDocument();
  });

  it("warns when there are no brands or no plans to choose from", () => {
    lists.brands = { isSuccess: true, isError: false, data: [], refetch: vi.fn() };
    lists.plans = { isSuccess: true, isError: false, data: [], refetch: vi.fn() };
    renderInApp(<AssignSubscriptionDialog onClose={vi.fn()} />);
    expect(screen.getByText(d.noBrands)).toBeInTheDocument();
    expect(screen.getByText(d.noPlans)).toBeInTheDocument();
  });

  it("shows a loading state while the options load", () => {
    lists.brands = { isSuccess: false, isError: false, data: undefined, refetch: vi.fn() };
    renderInApp(<AssignSubscriptionDialog onClose={vi.fn()} />);
    expect(screen.getByRole("status", { name: enDictionary.common.loading })).toBeInTheDocument();
  });

  it("offers a retry when an option list fails to load", async () => {
    const refetch = vi.fn();
    lists.plans = { isSuccess: false, isError: true, data: undefined, refetch };
    renderInApp(<AssignSubscriptionDialog onClose={vi.fn()} />);
    expect(screen.getByText(t.states.formErrorTitle)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: enDictionary.common.retry }));
    expect(refetch).toHaveBeenCalled();
  });
});
