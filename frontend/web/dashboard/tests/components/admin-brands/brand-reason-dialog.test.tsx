// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";

import { BrandReasonDialog } from "@/components/admin-brands/detail/brand-reason-dialog";
import { OverlayKind } from "@/enums/ui/overlay-kind.enum";
import { BrandLifecycleAction } from "@/enums/venue/brand-lifecycle-action.enum";
import { enDictionary } from "@/locales/en/index.constant";
import { renderInApp } from "@tests/helpers/list-screen.helper";
import { describeReasonDialog } from "@tests/helpers/reason-dialog.helper";
import type { AdminBrand } from "@/types/brands/admin-brand.type";

const mutateAsync = vi.hoisted(() => vi.fn());
vi.mock("@/hooks/brands/admin/use-brand-lifecycle", () => ({ useBrandLifecycle: () => ({ mutateAsync, isPending: false }) }));

const t = enDictionary.adminBrands;
const brand = { id: "bd1", name: "Cuts Co" } as unknown as AdminBrand;

describeReasonDialog({
  dialog: (onClose) => <BrandReasonDialog request={{ kind: OverlayKind.BrandReason, brand, action: BrandLifecycleAction.Reject }} onClose={onClose} />,
  mutate: mutateAsync,
  reasonLabel: t.reason,
  submitLabel: t.reject.confirm,
  tooShort: t.reasonRequired,
  failed: t.lifecycleFailed,
  expectedArgs: (reason) => ({ id: "bd1", action: BrandLifecycleAction.Reject, reason, cancelFutureBookings: undefined }),
});

it("offers to cancel future bookings only when suspending, and sends the choice", async () => {
  mutateAsync.mockReset();
  mutateAsync.mockResolvedValue(undefined);
  renderInApp(<BrandReasonDialog request={{ kind: OverlayKind.BrandReason, brand, action: BrandLifecycleAction.Suspend }} onClose={vi.fn()} />);
  await userEvent.type(screen.getByLabelText(/^Reason/), "Chargebacks pending");
  await userEvent.click(screen.getByRole("switch", { name: t.suspend.cancelBookings }));
  await userEvent.click(screen.getByRole("button", { name: t.suspend.confirm }));
  await vi.waitFor(() => expect(mutateAsync).toHaveBeenCalledWith({ id: "bd1", action: BrandLifecycleAction.Suspend, reason: "Chargebacks pending", cancelFutureBookings: true }));
});

it("does not offer the cancel-bookings switch when rejecting", () => {
  renderInApp(<BrandReasonDialog request={{ kind: OverlayKind.BrandReason, brand, action: BrandLifecycleAction.Reject }} onClose={vi.fn()} />);
  expect(screen.queryByText(t.suspend.cancelBookings)).not.toBeInTheDocument();
});
