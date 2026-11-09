"use client";

import { AssignSubscriptionDialog } from "@/components/admin-subscriptions/assign-subscription-dialog";
import { BrandDetailDialog } from "@/components/admin-brands/brand-detail-dialog";
import { CatalogCategoryDetailDialog } from "@/components/admin-catalog/catalog-category-detail-dialog";
import { CatalogCategoryFormDialog } from "@/components/admin-catalog/catalog-category-form-dialog";
import { PayoutActionDialog } from "@/components/admin-payouts/payout-action-dialog";
import { PlanFormDialog } from "@/components/plans/plan-form-dialog";
import { BranchFormDialog } from "@/components/branches/branch-form-dialog";
import { ChairFormDialog } from "@/components/chairs/chair-form-dialog";
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
