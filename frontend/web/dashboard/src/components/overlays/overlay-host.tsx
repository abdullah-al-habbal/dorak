"use client";

import dynamic from "next/dynamic";
import type { JSX } from "react";

import { ConfirmOverlay } from "@/components/overlays/confirm-overlay";
import { OverlayKind } from "@/enums/ui/overlay-kind.enum";
import type { OverlayRequest } from "@/types/ui/overlay-request.type";

// Dialogs open only on user action, so each loads its own chunk on first open instead of weighing down every portal page.
const AssignSubscriptionDialog = dynamic(() => import("@/components/admin-subscriptions/assign-subscription-dialog").then((module) => module.AssignSubscriptionDialog));
const ReviewResolveDialog = dynamic(() => import("@/components/review-moderation/review-resolve-dialog").then((module) => module.ReviewResolveDialog));
const AdminUserFormDialog = dynamic(() => import("@/components/admin-users/admin-user-form-dialog").then((module) => module.AdminUserFormDialog));
const BarberApprovalDetailDialog = dynamic(() => import("@/components/barber-approvals/barber-approval-detail-dialog").then((module) => module.BarberApprovalDetailDialog));
const ClientBanDialog = dynamic(() => import("@/components/clients/client-ban-dialog").then((module) => module.ClientBanDialog));
const ClientDetailDialog = dynamic(() => import("@/components/clients/client-detail-dialog").then((module) => module.ClientDetailDialog));
const BarberBanDialog = dynamic(() => import("@/components/barber-approvals/barber-ban-dialog").then((module) => module.BarberBanDialog));
const BarberRejectDialog = dynamic(() => import("@/components/barber-approvals/barber-reject-dialog").then((module) => module.BarberRejectDialog));
const BrandEditDialog = dynamic(() => import("@/components/admin-brands/detail/brand-edit-dialog").then((module) => module.BrandEditDialog));
const BrandReasonDialog = dynamic(() => import("@/components/admin-brands/detail/brand-reason-dialog").then((module) => module.BrandReasonDialog));
const BranchOversightDialog = dynamic(() => import("@/components/branches/oversight/branch-oversight-dialog").then((module) => module.BranchOversightDialog));
const BranchSuspendDialog = dynamic(() => import("@/components/branches/oversight/branch-suspend-dialog").then((module) => module.BranchSuspendDialog));
const BrandDetailDialog = dynamic(() => import("@/components/admin-brands/detail/brand-detail-dialog").then((module) => module.BrandDetailDialog));
const CatalogCategoryDetailDialog = dynamic(() => import("@/components/admin-catalog/catalog-category-detail-dialog").then((module) => module.CatalogCategoryDetailDialog));
const CatalogCategoryFormDialog = dynamic(() => import("@/components/admin-catalog/catalog-category-form-dialog").then((module) => module.CatalogCategoryFormDialog));
const PayoutActionDialog = dynamic(() => import("@/components/admin-payouts/payout-action-dialog").then((module) => module.PayoutActionDialog));
const PlanFormDialog = dynamic(() => import("@/components/plans/plan-form-dialog").then((module) => module.PlanFormDialog));
const BranchFormDialog = dynamic(() => import("@/components/branches/branch-form-dialog").then((module) => module.BranchFormDialog));
const ChairFormDialog = dynamic(() => import("@/components/chairs/chair-form-dialog").then((module) => module.ChairFormDialog));
const BrandCreateDialog = dynamic(() => import("@/components/owner-brand/brand-create-dialog").then((module) => module.BrandCreateDialog));
const ReviewDisputeDialog = dynamic(() => import("@/components/reviews/review-dispute-dialog").then((module) => module.ReviewDisputeDialog));
const JobApplicationsDialog = dynamic(() => import("@/components/jobs/job-applications-dialog").then((module) => module.JobApplicationsDialog));
const JobPostingFormDialog = dynamic(() => import("@/components/jobs/job-posting-form-dialog").then((module) => module.JobPostingFormDialog));
const InviteBarberDialog = dynamic(() => import("@/components/invitations/invite-barber-dialog").then((module) => module.InviteBarberDialog));
const RateClientDialog = dynamic(() => import("@/components/bookings/dialogs/rate-client-dialog").then((module) => module.RateClientDialog));
const RescheduleDialog = dynamic(() => import("@/components/bookings/dialogs/reschedule-dialog").then((module) => module.RescheduleDialog));
const ServiceFormDialog = dynamic(() => import("@/components/services/service-form-dialog").then((module) => module.ServiceFormDialog));
const CatalogItemFormDialog = dynamic(() => import("@/components/catalog-items/catalog-item-form-dialog").then((module) => module.CatalogItemFormDialog));
const CatalogTagFormDialog = dynamic(() => import("@/components/catalog-items/catalog-tag-form-dialog").then((module) => module.CatalogTagFormDialog));
const CommissionRuleFormDialog = dynamic(() => import("@/components/commissions/commission-rule-form-dialog").then((module) => module.CommissionRuleFormDialog));
const PaymentGatewayFormDialog = dynamic(() => import("@/components/payment-gateways/payment-gateway-form-dialog").then((module) => module.PaymentGatewayFormDialog));
const PayoutDetailDialog = dynamic(() => import("@/components/admin-payouts/payout-detail-dialog").then((module) => module.PayoutDetailDialog));
const ContentPageDialog = dynamic(() => import("@/components/website-content/content-page-dialog").then((module) => module.ContentPageDialog));
const ContentSectionDialog = dynamic(() => import("@/components/website-content/content-section-dialog").then((module) => module.ContentSectionDialog));
const TestimonialDialog = dynamic(() => import("@/components/website-content/testimonial-dialog").then((module) => module.TestimonialDialog));
const CurrencyFormDialog = dynamic(() => import("@/components/currencies/currency-form-dialog").then((module) => module.CurrencyFormDialog));
const ExchangeRateDialog = dynamic(() => import("@/components/currencies/exchange-rate-dialog").then((module) => module.ExchangeRateDialog));
const StylistPricingDialog = dynamic(() => import("@/components/stylists/stylist-pricing-dialog").then((module) => module.StylistPricingDialog));
const StylistFormDialog = dynamic(() => import("@/components/stylists/stylist-form-dialog").then((module) => module.StylistFormDialog));
const WalkInDialog = dynamic(() => import("@/components/bookings/dialogs/walk-in-dialog").then((module) => module.WalkInDialog));

interface OverlayHostProps {
  request: OverlayRequest | null;
  onClose: () => void;
}

/** The single mount point for every dialog and sheet. The switch is exhaustive over `OverlayKind`. */
export function OverlayHost({ request, onClose }: OverlayHostProps): JSX.Element | null {
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
