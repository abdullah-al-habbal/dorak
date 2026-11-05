import type { ConfirmOverlayRequest } from "@/interfaces/confirm-overlay-request.interface";
import type { RescheduleOverlayRequest } from "@/interfaces/reschedule-overlay-request.interface";
import type { WalkInOverlayRequest } from "@/interfaces/walk-in-overlay-request.interface";

/** Every dialog or sheet the portal can show. Feature modules add their own member here. */
export type OverlayRequest = ConfirmOverlayRequest | WalkInOverlayRequest | RescheduleOverlayRequest;
