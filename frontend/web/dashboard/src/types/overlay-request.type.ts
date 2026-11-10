import type { BranchFormOverlayRequest } from "@/interfaces/branch-form-overlay-request.interface";
import type { AdminUserFormOverlayRequest } from "@/interfaces/admin-user-form-overlay-request.interface";
import type { AssignSubscriptionOverlayRequest } from "@/interfaces/assign-subscription-overlay-request.interface";
import type { BarberApprovalDetailOverlayRequest } from "@/interfaces/barber-approval-detail-overlay-request.interface";
import type { BarberRejectOverlayRequest } from "@/interfaces/barber-reject-overlay-request.interface";
import type { BrandEditOverlayRequest } from "@/interfaces/brand-edit-overlay-request.interface";
import type { BrandReasonOverlayRequest } from "@/interfaces/brand-reason-overlay-request.interface";
import type { BranchSuspendOverlayRequest } from "@/interfaces/branch-suspend-overlay-request.interface";
import type { BrandDetailOverlayRequest } from "@/interfaces/brand-detail-overlay-request.interface";
import type { CatalogCategoryDetailOverlayRequest } from "@/interfaces/catalog-category-detail-overlay-request.interface";
import type { CatalogCategoryFormOverlayRequest } from "@/interfaces/catalog-category-form-overlay-request.interface";
import type { ChairFormOverlayRequest } from "@/interfaces/chair-form-overlay-request.interface";
import type { ConfirmOverlayRequest } from "@/interfaces/confirm-overlay-request.interface";
import type { PayoutActionOverlayRequest } from "@/interfaces/payout-action-overlay-request.interface";
import type { PlanFormOverlayRequest } from "@/interfaces/plan-form-overlay-request.interface";
import type { ReviewResolveOverlayRequest } from "@/interfaces/review-resolve-overlay-request.interface";
import type { RescheduleOverlayRequest } from "@/interfaces/reschedule-overlay-request.interface";
import type { ServiceFormOverlayRequest } from "@/interfaces/service-form-overlay-request.interface";
import type { StylistFormOverlayRequest } from "@/interfaces/stylist-form-overlay-request.interface";
import type { WalkInOverlayRequest } from "@/interfaces/walk-in-overlay-request.interface";

/** Every dialog or sheet the portal can show. Feature modules add their own member here. */
export type OverlayRequest = ConfirmOverlayRequest | WalkInOverlayRequest | RescheduleOverlayRequest | StylistFormOverlayRequest | ServiceFormOverlayRequest | ChairFormOverlayRequest | BranchFormOverlayRequest | PayoutActionOverlayRequest | PlanFormOverlayRequest | AssignSubscriptionOverlayRequest | BrandDetailOverlayRequest | BrandReasonOverlayRequest | BrandEditOverlayRequest | BranchSuspendOverlayRequest | BarberApprovalDetailOverlayRequest | BarberRejectOverlayRequest | AdminUserFormOverlayRequest | ReviewResolveOverlayRequest | CatalogCategoryFormOverlayRequest | CatalogCategoryDetailOverlayRequest;
