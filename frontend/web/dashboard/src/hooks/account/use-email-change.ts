"use client";

import { useState } from "react";

import { useDictionary } from "@/hooks/core/use-dictionary";
import { useFeedbackMutation } from "@/hooks/core/use-feedback-mutation";
import { accountKeys } from "@/lib/query-keys/account/account-keys";
import { requestEmailChange, verifyEmailChange } from "@/services/api/mutation/account/account.mutation";
import { useAuthStore } from "@/store/auth.store";
import type { AccountProfile } from "@/types/account/account-profile.type";
import type { EmailChangeResult } from "@/types/account/email-change-result.type";

interface EmailChange {
  /** The address waiting for its code; the code step shows while this is set. */
  pendingEmail: string | null;
  request: (email: string) => Promise<EmailChangeResult>;
  verify: (code: string) => Promise<AccountProfile>;
  startOver: () => void;
  requesting: boolean;
  verifying: boolean;
}

/** The two-step email change: request a code for the new address, then confirm it. The old email works until then. */
export function useEmailChange(profile: AccountProfile): EmailChange {
  const { account } = useDictionary();
  const patchProfile = useAuthStore((state) => state.patchProfile);
  const [dismissed, setDismissed] = useState<string | null>(null);
  const pendingEmail = profile.pending_email && profile.pending_email !== dismissed ? profile.pending_email : null;

  const requestMutation = useFeedbackMutation({
    mutationFn: requestEmailChange,
    invalidate: [accountKeys.profile],
    successMessage: (result: EmailChangeResult) => account.email.sent.replace("{email}", result.pending_email),
  });
  const verifyMutation = useFeedbackMutation({
    mutationFn: verifyEmailChange,
    invalidate: [accountKeys.profile],
    successMessage: (updated: AccountProfile) => account.email.changed.replace("{email}", updated.email ?? ""),
  });

  const request = async (email: string): Promise<EmailChangeResult> => {
    const result = await requestMutation.mutateAsync(email);
    setDismissed(null);
    return result;
  };
  const verify = async (code: string): Promise<AccountProfile> => {
    const updated = await verifyMutation.mutateAsync(code);
    patchProfile({ email: updated.email });
    return updated;
  };

  return { pendingEmail, request, verify, startOver: () => setDismissed(pendingEmail), requesting: requestMutation.isPending, verifying: verifyMutation.isPending };
}
