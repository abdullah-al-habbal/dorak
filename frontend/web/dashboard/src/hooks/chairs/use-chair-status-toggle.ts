"use client";

import { ApiErrorCode } from "@/enums/api-error-code.enum";
import { ChairStatus } from "@/enums/chair-status.enum";
import { OverlayKind } from "@/enums/overlay-kind.enum";
import { useDictionary } from "@/hooks/core/use-dictionary";
import { useOverlay } from "@/hooks/core/use-overlay";
import { useUpdateChairStatus } from "@/hooks/chairs/use-update-chair-status";
import { ApiClientError } from "@/services/api/core/api-client-error";
import type { Chair } from "@/types/chairs/chair.type";

interface ChairStatusToggle {
  /** `inService` true puts the chair back to available; false moves it to maintenance. */
  toggle: (chair: Chair, inService: boolean) => void;
  togglingId: string | null;
}

function hasActiveBookings(error: unknown): boolean {
  return error instanceof ApiClientError && error.code === ApiErrorCode.Conflict;
}

/** The proxy reports every backend 409 as `conflict`. Moving to maintenance is refused while bookings exist; the user then confirms cancelling them. */
export function useChairStatusToggle(): ChairStatusToggle {
  const { chairs } = useDictionary();
  const overlay = useOverlay();
  const update = useUpdateChairStatus();
  const { mutate } = update;

  const toggle = (chair: Chair, inService: boolean) => {
    if (inService) {
      mutate({ chair, status: ChairStatus.Available });
      return;
    }
    mutate(
      { chair, status: ChairStatus.Maintenance },
      {
        onError: (error) => {
          if (!hasActiveBookings(error)) return;
          overlay.open({
            kind: OverlayKind.Confirm,
            title: chairs.confirm.maintenanceTitle,
            description: chairs.confirm.maintenanceBody,
            confirmLabel: chairs.confirm.maintenance,
            destructive: true,
            onConfirm: async () => {
              await update.mutateAsync({ chair, status: ChairStatus.Maintenance, force: true });
            },
          });
        },
      },
    );
  };

  return { toggle, togglingId: update.isPending ? (update.variables?.chair.id ?? null) : null };
}
