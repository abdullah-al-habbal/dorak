"use client";

import type { JSX } from "react";

import { InvitationStatusBadge } from "@/components/invitations/invitation-status-badge";
import { Button } from "@/components/ui/button";
import { AffiliationInitiator } from "@/enums/affiliation-initiator.enum";
import { AffiliationStatus } from "@/enums/affiliation-status.enum";
import { useI18n } from "@/hooks/core/use-i18n";
import { localizedText } from "@/lib/booking-format.util";
import type { InvitationAction } from "@/services/api/mutation/invitation.mutation";
import type { BranchInvitation } from "@/types/branches/branch-invitation.type";

interface InvitationRowProps {
  invitation: BranchInvitation;
  /** The platform admin only reads; branch teams act. */
  readOnly: boolean;
  busy: boolean;
  onAct: (invitation: BranchInvitation, action: InvitationAction) => void;
}

/** One invitation. A pending request from the barber can be accepted or rejected; the branch's own pending invitation waits for the barber; an active one can be ended. */
export function InvitationRow({ invitation, readOnly, busy, onAct }: InvitationRowProps): JSX.Element {
  const { dictionary, locale } = useI18n();
  const { invitations: t } = dictionary;
  const pending = invitation.status === AffiliationStatus.Pending;
  const fromBarber = invitation.initiated_by_type === AffiliationInitiator.Barber;
  const date = invitation.invited_at ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(invitation.invited_at)) : null;
  const commission = invitation.commission_percent === null || invitation.commission_percent === undefined ? null : `${invitation.commission_percent}%`;

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 p-4">
      <div className="flex min-w-0 flex-col gap-1">
        <span dir="auto" className="truncate font-medium">{localizedText(invitation.barber_name, locale) || t.unknownBarber}</span>
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <InvitationStatusBadge status={invitation.status} />
          <span>{fromBarber ? t.fromBarber : t.fromBranch}</span>
          {commission ? <span className="tabular">{t.commission.replace("{value}", commission)}</span> : null}
          {date ? <time dateTime={invitation.invited_at ?? undefined} className="tabular">{date}</time> : null}
        </span>
      </div>
      {readOnly ? null : (
        <div className="flex flex-wrap gap-2">
          {pending && fromBarber ? (
            <>
              <Button type="button" size="sm" disabled={busy} onClick={() => onAct(invitation, "accept")}>{t.action.accept}</Button>
              <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => onAct(invitation, "reject")}>{t.action.reject}</Button>
            </>
          ) : null}
          {pending && !fromBarber ? <span className="text-sm text-muted-foreground">{t.waiting}</span> : null}
          {invitation.status === AffiliationStatus.Active ? (
            <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => onAct(invitation, "terminate")}>{t.action.terminate}</Button>
          ) : null}
        </div>
      )}
    </li>
  );
}
