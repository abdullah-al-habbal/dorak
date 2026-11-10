"use client";

import { AssignSubscriptionDialog } from "@/components/admin-subscriptions/assign-subscription-dialog";
import { ReviewResolveDialog } from "@/components/review-moderation/review-resolve-dialog";
import { AdminUserFormDialog } from "@/components/admin-users/admin-user-form-dialog";
import { BarberApprovalDetailDialog } from "@/components/barber-approvals/barber-approval-detail-dialog";
import { ClientBanDialog } from "@/components/clients/client-ban-dialog";
import { ClientDetailDialog } from "@/components/clients/client-detail-dialog";
import { BarberBanDialog } from "@/components/barber-approvals/barber-ban-dialog";
import { BarberRejectDialog } from "@/components/barber-approvals/barber-reject-dialog";
import { BrandEditDialog } from "@/components/admin-brands/brand-edit-dialog";
import { BrandReasonDialog } from "@/components/admin-brands/brand-reason-dialog";
import { BranchOversightDialog } from "@/components/branches/branch-oversight-dialog";
import { BranchSuspendDialog } from "@/components/branches/branch-suspend-dialog";
import { BrandDetailDialog } from "@/components/admin-brands/brand-detail-dialog";
import { CatalogCategoryDetailDialog } from "@/components/admin-catalog/catalog-category-detail-dialog";
import { CatalogCategoryFormDialog } from "@/components/admin-catalog/catalog-category-form-dialog";
import { PayoutActionDialog } from "@/components/admin-payouts/payout-action-dialog";
import { PlanFormDialog } from "@/components/plans/plan-form-dialog";
import { BranchFormDialog } from "@/components/branches/branch-form-dialog";
import { ChairFormDialog } from "@/components/chairs/chair-form-dialog";
import { RateClientDialog } from "@/components/bookings/rate-client-dialog";
import { RescheduleDialog } from "@/components/bookings/reschedule-dialog";
import { ServiceFormDialog } from "@/components/services/service-form-dialog";
import { StylistFormDialog } from "@/components/stylists/stylist-form-dialog";
import { WalkInDialog } from "@/components/bookings/walk-in-dialog";
import { ConfirmOverlay } from "@/components/overlays/confirm-overlay";
import { OverlayKind } from "@/enums/overlay-kind.enum";
import type { OverlayRequest } from "@/types/overlay-request.type";

interface OverlayHostProps {
  request: OverlayRequest | null;
  onClose: () => void;
}

/** The single mount point for every dialog and sheet. The switch is exhaustive over `OverlayKind`. */
export function OverlayHost({ request, onClose }: OverlayHostProps) {
  if (!request) return null;
  switch (request.kind) {
    case OverlayKind.Confirm:
      return <ConfirmOverlay request={request} onClose={onClose} />;
    case OverlayKind.WalkIn:
      return <WalkInDialog onClose={onClose} />;
    case OverlayKind.RateClient:
      return <RateClientDialog booking={request.booking} onClose={onClose} />;
    case OverlayKind.Reschedule:
      return <RescheduleDialog booking={request.booking} onClose={onClose} />;
    case OverlayKind.StylistForm:
      return <StylistFormDialog stylist={request.stylist} onClose={onClose} />;
    case OverlayKind.ServiceForm:
      return <ServiceFormDialog service={request.service} brandId={request.brandId} onClose={onClose} />;
    case OverlayKind.ChairForm:
      return <ChairFormDialog chair={request.chair} onClose={onClose} />;
    case OverlayKind.BranchForm:
      return <BranchFormDialog branch={request.branch} onClose={onClose} />;
    case OverlayKind.PayoutAction:
      return <PayoutActionDialog payout={request.payout} action={request.action} onClose={onClose} />;
    case OverlayKind.PlanForm:
      return <PlanFormDialog plan={request.plan} onClose={onClose} />;
    case OverlayKind.AssignSubscription:
      return <AssignSubscriptionDialog onClose={onClose} />;
    case OverlayKind.BrandDetail:
      return <BrandDetailDialog brand={request.brand} onClose={onClose} />;
    case OverlayKind.BarberApprovalDetail:
      return <BarberApprovalDetailDialog barber={request.barber} onClose={onClose} />;
    case OverlayKind.BarberBan:
      return <BarberBanDialog barber={request.barber} onClose={onClose} />;
    case OverlayKind.ClientDetail:
      return <ClientDetailDialog client={request.client} onClose={onClose} />;
    case OverlayKind.ClientBan:
      return <ClientBanDialog client={request.client} onClose={onClose} />;
    case OverlayKind.BarberReject:
      return <BarberRejectDialog barber={request.barber} onClose={onClose} />;
    case OverlayKind.AdminUserForm:
      return <AdminUserFormDialog admin={request.admin} onClose={onClose} />;
    case OverlayKind.ReviewResolve:
      return <ReviewResolveDialog review={request.review} onClose={onClose} />;
    case OverlayKind.BrandReason:
      return <BrandReasonDialog request={request} onClose={onClose} />;
    case OverlayKind.BrandEdit:
      return <BrandEditDialog brand={request.brand} onClose={onClose} />;
    case OverlayKind.BranchOversight:
      return <BranchOversightDialog branch={request.branch} onClose={onClose} />;
    case OverlayKind.BranchSuspend:
      return <BranchSuspendDialog branch={request.branch} onClose={onClose} />;
    case OverlayKind.CatalogCategoryForm:
      return <CatalogCategoryFormDialog category={request.category} onClose={onClose} />;
    case OverlayKind.CatalogCategoryDetail:
      return <CatalogCategoryDetailDialog category={request.category} onClose={onClose} />;
    default: {
      const unhandled: never = request;
      throw new Error(`Unhandled overlay kind: ${JSON.stringify(unhandled)}`);
    }
  }
}
