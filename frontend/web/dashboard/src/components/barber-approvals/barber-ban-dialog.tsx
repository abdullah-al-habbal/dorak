"use client";

import type { JSX } from "react";

import { AccountBanDialog } from "@/components/common/account-ban-dialog";
import { useBanBarber } from "@/hooks/stylists/use-ban-barber";
import { useI18n } from "@/hooks/core/use-i18n";
import { localizedText } from "@/lib/booking-format.util";
import type { BarberApproval } from "@/types/stylists/barber-approval.type";

interface BarberBanDialogProps {
  barber: BarberApproval;
  onClose: () => void;
}

export function BarberBanDialog({ barber, onClose }: BarberBanDialogProps): JSX.Element {
  const { dictionary, locale } = useI18n();
  const { banDialog: copy } = dictionary.barberApprovals;
  const mutation = useBanBarber();
  return (
    <AccountBanDialog
      copy={copy}
      body={copy.body.replace("{barber}", localizedText(barber.name, locale))}
      pending={mutation.isPending}
      onSubmit={(submission) => mutation.mutateAsync({ id: barber.id, ...submission })}
      onClose={onClose}
    />
  );
}
