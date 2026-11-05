"use client";

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
    default: {
      const unhandled: never = request.kind;
      throw new Error(`Unhandled overlay kind: ${String(unhandled)}`);
    }
  }
}
