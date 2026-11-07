"use client";

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
    default: {
      const unhandled: never = request;
      throw new Error(`Unhandled overlay kind: ${JSON.stringify(unhandled)}`);
    }
  }
}
