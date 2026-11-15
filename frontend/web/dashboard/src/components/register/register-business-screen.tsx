"use client";

import Link from "next/link";
import type { JSX } from "react";
import { useState } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { ExistingOwnerForm } from "@/components/register/existing-owner-form";
import { RegisterDetailsForm } from "@/components/register/register-details-form";
import { VerifyCodeForm } from "@/components/register/verify-code-form";
import { Button } from "@/components/ui/button";
import { loginRoute } from "@/config/routes.constant";
import { AuthActor } from "@/enums/auth-actor.enum";
import { useDictionary } from "@/hooks/core/use-dictionary";
import type { Currency } from "@/types/platform/currency.type";

/** The public owner sign-up: details, then the emailed code; an existing client takes the other form instead. */
export function RegisterBusinessScreen({ currencies }: { currencies: readonly Currency[] }): JSX.Element {
  const { registerBusiness: t } = useDictionary();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [hasAccount, setHasAccount] = useState(false);

  const title = sentTo ? t.verify.title : hasAccount ? t.existing.title : t.title;
  const description = sentTo ? "" : hasAccount ? t.existing.body : t.body;

  return (
    <AuthShell eyebrow={t.eyebrow} title={title} description={description} footer={sentTo ? null : <Footer hasAccount={hasAccount} onToggle={() => setHasAccount((value) => !value)} />}>
      {sentTo ? (
        <VerifyCodeForm email={sentTo} onChangeEmail={() => setSentTo(null)} />
      ) : hasAccount ? (
        <ExistingOwnerForm currencies={currencies} />
      ) : (
        <RegisterDetailsForm currencies={currencies} onSent={setSentTo} />
      )}
    </AuthShell>
  );
}

function Footer({ hasAccount, onToggle }: { hasAccount: boolean; onToggle: () => void }): JSX.Element {
  const { registerBusiness: t } = useDictionary();
  return (
    <div className="flex flex-col items-start gap-2">
      <Button type="button" variant="link" className="h-auto p-0" onClick={onToggle}>
        {hasAccount ? t.newAccount : t.haveAccount}
      </Button>
      <Link href={loginRoute(AuthActor.Owner)} className="font-medium text-foreground underline-offset-4 hover:underline">
        {t.signIn}
      </Link>
    </div>
  );
}
