import type { OverlayKind } from "@/enums/overlay-kind.enum";
import type { AdminUser } from "@/types/platform/admin-user.type";

export interface AdminUserFormOverlayRequest {
  kind: OverlayKind.AdminUserForm;
  /** Present when editing; absent when inviting. */
  admin?: AdminUser;
}
