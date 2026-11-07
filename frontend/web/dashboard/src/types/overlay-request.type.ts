import type { BranchFormOverlayRequest } from "@/interfaces/branch-form-overlay-request.interface";
import type { ChairFormOverlayRequest } from "@/interfaces/chair-form-overlay-request.interface";
import type { ConfirmOverlayRequest } from "@/interfaces/confirm-overlay-request.interface";
import type { RescheduleOverlayRequest } from "@/interfaces/reschedule-overlay-request.interface";
import type { ServiceFormOverlayRequest } from "@/interfaces/service-form-overlay-request.interface";
import type { StylistFormOverlayRequest } from "@/interfaces/stylist-form-overlay-request.interface";
import type { WalkInOverlayRequest } from "@/interfaces/walk-in-overlay-request.interface";

/** Every dialog or sheet the portal can show. Feature modules add their own member here. */
export type OverlayRequest = ConfirmOverlayRequest | WalkInOverlayRequest | RescheduleOverlayRequest | StylistFormOverlayRequest | ServiceFormOverlayRequest | ChairFormOverlayRequest | BranchFormOverlayRequest;
