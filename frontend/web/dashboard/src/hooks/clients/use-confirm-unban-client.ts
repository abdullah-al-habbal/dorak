"use client";

import { OverlayKind } from "@/enums/overlay-kind.enum";
import { useI18n } from "@/hooks/core/use-i18n";
import { useOverlay } from "@/hooks/core/use-overlay";
import { useUnbanClient } from "@/hooks/clients/use-unban-client";
import { localizedText } from "@/lib/core/booking-format.util";
import type { AdminClient } from "@/types/clients/admin-client.type";

/** Opens the unban confirmation. */
export function useConfirmUnbanClient(): (client: AdminClient) => void {
  const { dictionary, locale } = useI18n();
  const { unban } = dictionary.clients;
  const overlay = useOverlay();
  const { mutateAsync: unbanClient } = useUnbanClient();
  return (client: AdminClient) => {
    overlay.open({
      kind: OverlayKind.Confirm,
      title: unban.title,
      description: unban.body.replace("{client}", localizedText(client.name, locale)),
      confirmLabel: unban.confirm,
      onConfirm: async () => {
        await unbanClient(client.id);
      },
    });
  };
}
