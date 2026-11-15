"use client";

import type { JSX } from "react";

import { AccountBanDialog } from "@/components/common/account-ban-dialog";
import { useBanClient } from "@/hooks/clients/clients/use-ban-client";
import { useI18n } from "@/hooks/core/state/use-i18n";
import { localizedText } from "@/lib/core/format/booking-format.util";
import type { AdminClient } from "@/types/clients/clients/admin-client.type";

interface ClientBanDialogProps {
  client: AdminClient;
  onClose: () => void;
}

export function ClientBanDialog({ client, onClose }: ClientBanDialogProps): JSX.Element {
  const { dictionary, locale } = useI18n();
  const { ban: copy } = dictionary.clients;
  const mutation = useBanClient();
  return (
    <AccountBanDialog
      copy={copy}
      body={copy.body.replace("{client}", localizedText(client.name, locale))}
      pending={mutation.isPending}
      onSubmit={(submission) => mutation.mutateAsync({ id: client.id, ...submission })}
      onClose={onClose}
    />
  );
}
