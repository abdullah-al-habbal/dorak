import type { OverlayKind } from "@/enums/ui/overlay-kind.enum";

export interface ConfirmOverlayRequest {
  kind: OverlayKind.Confirm;
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  /** A rejected promise keeps the dialog open, so the caller can show its own toast. */
  onConfirm: () => void | Promise<void>;
}
