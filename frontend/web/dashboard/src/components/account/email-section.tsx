"use client";

import type { JSX } from "react";

import { AccountSection } from "@/components/account/account-section";
import { EmailCodeForm } from "@/components/account/email-code-form";
import { EmailRequestForm } from "@/components/account/email-request-form";
import { useDictionary } from "@/hooks/core/use-dictionary";
import { useEmailChange } from "@/hooks/account/use-email-change";
import type { AccountProfile } from "@/types/account/account-profile.type";

export function EmailSection({ profile }: { profile: AccountProfile }): JSX.Element {
  const { account } = useDictionary();
  const t = account.email;
  const change = useEmailChange(profile);

  return (
    <AccountSection id="email" title={t.title} description={t.description}>
      <dl className="flex flex-col gap-1">
        <dt className="text-sm text-muted-foreground">{t.current}</dt>
        <dd className="font-medium break-all" translate="no">{profile.email}</dd>
      </dl>
      {change.pendingEmail ? (
        <EmailCodeForm pendingEmail={change.pendingEmail} verify={change.verify} verifying={change.verifying} onStartOver={change.startOver} />
      ) : (
        <EmailRequestForm request={change.request} requesting={change.requesting} />
      )}
    </AccountSection>
  );
}
