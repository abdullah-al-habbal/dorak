"use client";

import type { JSX } from "react";

import { EmailSection } from "@/components/account/email-section";
import { LanguageSection } from "@/components/account/language-section";
import { NotificationsSection } from "@/components/account/notifications-section";
import { PasswordSection } from "@/components/account/password-section";
import { ProfileSection } from "@/components/account/profile-section";
import { ErrorState } from "@/components/common/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccountProfile } from "@/hooks/use-account-profile";
import { useDictionary } from "@/hooks/use-dictionary";

/** Every actor's own account: profile, sign-in email, password, notifications and language. */
export function AccountScreen(): JSX.Element {
  const { account } = useDictionary();
  const profile = useAccountProfile();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-semibold">{account.title}</h1>
        <p className="max-w-prose text-sm text-muted-foreground">{account.description}</p>
      </div>
      <div aria-busy={profile.isFetching} className="flex flex-col gap-4">
        {profile.isPending ? (
          <div role="status" aria-label={account.states.loading} className="flex flex-col gap-4">
            <Skeleton className="h-44 w-full" />
            <Skeleton className="h-56 w-full" />
          </div>
        ) : null}
        {profile.isError && !profile.data ? <ErrorState title={account.states.errorTitle} body={account.states.errorBody} onRetry={() => profile.refetch()} /> : null}
        {profile.data ? (
          <>
            <ProfileSection displayName={profile.data.display_name} />
            <EmailSection profile={profile.data} />
            <PasswordSection email={profile.data.email} />
            <NotificationsSection />
            <LanguageSection />
          </>
        ) : null}
      </div>
    </div>
  );
}
