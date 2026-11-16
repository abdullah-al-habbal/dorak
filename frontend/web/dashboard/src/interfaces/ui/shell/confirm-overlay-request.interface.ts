import type { OverlayKind } from "@/enums/ui/overlay-kind.enum";

/** An optional free-text reason shown in the confirm dialog; empty is allowed, a short entry is not. */
export interface ConfirmReasonField {
  label: string;
}

export interface ConfirmOverlayRequest {
  kind: OverlayKind.Confirm;
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  /** Adds a reason box; its trimmed text, or `undefined` when empty, reaches `onConfirm`. */
  reason?: ConfirmReasonField;
  /** A rejected promise keeps the dialog open, so the caller can show its own toast. */
  onConfirm: (reason?: string) => void | Promise<void>;
}
