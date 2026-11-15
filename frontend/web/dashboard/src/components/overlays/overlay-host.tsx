"use client";

import { AssignSubscriptionDialog } from "@/components/admin-subscriptions/assign-subscription-dialog";
import { ReviewResolveDialog } from "@/components/review-moderation/review-resolve-dialog";
import { AdminUserFormDialog } from "@/components/admin-users/admin-user-form-dialog";
import { BarberApprovalDetailDialog } from "@/components/barber-approvals/barber-approval-detail-dialog";
import { ClientBanDialog } from "@/components/clients/client-ban-dialog";
import { ClientDetailDialog } from "@/components/clients/client-detail-dialog";
import { BarberBanDialog } from "@/components/barber-approvals/barber-ban-dialog";
import { BarberRejectDialog } from "@/components/barber-approvals/barber-reject-dialog";
import { BrandEditDialog } from "@/components/admin-brands/detail/brand-edit-dialog";
import { BrandReasonDialog } from "@/components/admin-brands/detail/brand-reason-dialog";
import { BranchOversightDialog } from "@/components/branches/oversight/branch-oversight-dialog";
import { BranchSuspendDialog } from "@/components/branches/oversight/branch-suspend-dialog";
import { BrandDetailDialog } from "@/components/admin-brands/detail/brand-detail-dialog";
import { CatalogCategoryDetailDialog } from "@/components/admin-catalog/catalog-category-detail-dialog";
import { CatalogCategoryFormDialog } from "@/components/admin-catalog/catalog-category-form-dialog";
import { PayoutActionDialog } from "@/components/admin-payouts/payout-action-dialog";
import { PlanFormDialog } from "@/components/plans/plan-form-dialog";
import { BranchFormDialog } from "@/components/branches/branch-form-dialog";
import { ChairFormDialog } from "@/components/chairs/chair-form-dialog";
import { BrandCreateDialog } from "@/components/owner-brand/brand-create-dialog";
import { ReviewDisputeDialog } from "@/components/reviews/review-dispute-dialog";
import { JobApplicationsDialog } from "@/components/jobs/job-applications-dialog";
import { JobPostingFormDialog } from "@/components/jobs/job-posting-form-dialog";
import { InviteBarberDialog } from "@/components/invitations/invite-barber-dialog";
import { RateClientDialog } from "@/components/bookings/dialogs/rate-client-dialog";
import { RescheduleDialog } from "@/components/bookings/dialogs/reschedule-dialog";
import { ServiceFormDialog } from "@/components/services/service-form-dialog";
import { CatalogItemFormDialog } from "@/components/catalog-items/catalog-item-form-dialog";
import { CatalogTagFormDialog } from "@/components/catalog-items/catalog-tag-form-dialog";
import { CommissionRuleFormDialog } from "@/components/commissions/commission-rule-form-dialog";
import { PaymentGatewayFormDialog } from "@/components/payment-gateways/payment-gateway-form-dialog";
import { PayoutDetailDialog } from "@/components/admin-payouts/payout-detail-dialog";
import { ContentPageDialog } from "@/components/website-content/content-page-dialog";
import { ContentSectionDialog } from "@/components/website-content/content-section-dialog";
import { TestimonialDialog } from "@/components/website-content/testimonial-dialog";
import { CurrencyFormDialog } from "@/components/currencies/currency-form-dialog";
import { ExchangeRateDialog } from "@/components/currencies/exchange-rate-dialog";
import { StylistPricingDialog } from "@/components/stylists/stylist-pricing-dialog";
import { StylistFormDialog } from "@/components/stylists/stylist-form-dialog";
import { WalkInDialog } from "@/components/bookings/dialogs/walk-in-dialog";
import { ConfirmOverlay } from "@/components/overlays/confirm-overlay";
import { OverlayKind } from "@/enums/ui/overlay-kind.enum";
import type { OverlayRequest } from "@/types/ui/overlay-request.type";

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
    case OverlayKind.BrandCreate:
      return <BrandCreateDialog onClose={onClose} />;
    case OverlayKind.ReviewDispute:
      return <ReviewDisputeDialog branchId={request.branchId} review={request.review} onClose={onClose} />;
    case OverlayKind.InviteBarber:
      return <InviteBarberDialog branchId={request.branchId} barber={request.barber} onClose={onClose} />;
    case OverlayKind.JobPostingForm:
      return <JobPostingFormDialog branchId={request.branchId} posting={request.posting} onClose={onClose} />;
    case OverlayKind.JobApplications:
      return <JobApplicationsDialog branchId={request.branchId} posting={request.posting} onClose={onClose} />;
    case OverlayKind.RateClient:
      return <RateClientDialog booking={request.booking} onClose={onClose} />;
    case OverlayKind.Reschedule:
      return <RescheduleDialog booking={request.booking} onClose={onClose} />;
    case OverlayKind.StylistPricing:
      return <StylistPricingDialog stylist={request.stylist} onClose={onClose} />;
    case OverlayKind.CatalogItemForm:
      return <CatalogItemFormDialog item={request.item} onClose={onClose} />;
    case OverlayKind.CatalogTagForm:
      return <CatalogTagFormDialog tag={request.tag} onClose={onClose} />;
    case OverlayKind.CommissionRuleForm:
      return <CommissionRuleFormDialog rule={request.rule} onClose={onClose} />;
    case OverlayKind.PaymentGatewayForm:
      return <PaymentGatewayFormDialog gateway={request.gateway} onClose={onClose} />;
    case OverlayKind.PayoutDetail:
      return <PayoutDetailDialog payout={request.payout} onClose={onClose} />;
    case OverlayKind.ContentPageForm:
      return <ContentPageDialog page={request.page} onClose={onClose} />;
    case OverlayKind.ContentSectionForm:
      return <ContentSectionDialog section={request.section} onClose={onClose} />;
    case OverlayKind.TestimonialForm:
      return <TestimonialDialog testimonial={request.testimonial} sections={request.sections} onClose={onClose} />;
    case OverlayKind.CurrencyForm:
      return <CurrencyFormDialog currency={request.currency} onClose={onClose} />;
    case OverlayKind.ExchangeRateForm:
      return <ExchangeRateDialog onClose={onClose} />;
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
