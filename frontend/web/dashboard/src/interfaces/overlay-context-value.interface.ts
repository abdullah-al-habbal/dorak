import type { OverlayRequest } from "@/types/overlay-request.type";

export interface OverlayContextValue {
  request: OverlayRequest | null;
  open: (request: OverlayRequest) => void;
  close: () => void;
}
