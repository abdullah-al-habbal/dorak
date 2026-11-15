"use client";

import { OverlayKind } from "@/enums/overlay-kind.enum";
import { useI18n } from "@/hooks/core/use-i18n";
import { useOverlay } from "@/hooks/core/use-overlay";
import { useSetAdminUserActive } from "@/hooks/platform/use-set-admin-user-active";
import { localizedText } from "@/lib/core/booking-format.util";
import type { AdminUser } from "@/types/platform/admin-user.type";

/** Opens the deactivate or reactivate confirmation for one admin. */
export function useConfirmAdminUserActive(): (admin: AdminUser) => void {
  const { dictionary, locale } = useI18n();
  const { confirm } = dictionary.adminUsers;
  const overlay = useOverlay();
  const { mutateAsync: setActive } = useSetAdminUserActive();
  return (admin: AdminUser) => {
    const name = localizedText(admin.name, locale) || admin.email;
    const activate = !admin.is_active;
    const copy = activate ? confirm.reactivate : confirm.deactivate;
    overlay.open({
      kind: OverlayKind.Confirm,
      title: copy.title,
      description: copy.body.replace("{admin}", name),
      confirmLabel: copy.confirm,
      destructive: !activate,
      onConfirm: async () => {
        await setActive({ id: admin.id, active: activate });
      },
    });
  };
}
