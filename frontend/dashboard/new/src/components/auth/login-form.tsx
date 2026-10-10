"use client";

import { Button } from "@/components/tailgrids/core/button";
import { FieldError } from "@/components/tailgrids/core/field";
import { Input } from "@/components/tailgrids/core/input";
import { Label } from "@/components/tailgrids/core/label";
import { TextField } from "@/components/tailgrids/core/text-field";
import { useLoginForm } from "@/hooks/use-login-form";
import { useDictionary } from "@/hooks/use-dictionary";
import type { AuthActor } from "@/services/api/auth/auth.types";

interface LoginFormProps {
  actor: AuthActor;
  callbackUrl?: string;
}

export function LoginForm({ actor, callbackUrl }: LoginFormProps) {
  const dictionary = useDictionary();
  const login = useLoginForm({ actor, callbackUrl });

  return (
    <form className="mt-6 flex flex-col gap-4" onSubmit={login.submit} noValidate>
      <TextField className="w-full gap-1.5" invalid={login.isError} required>
        <Label>{dictionary.auth.emailLabel}</Label>
        <Input
          name="email"
          type="email"
          autoComplete="email"
          placeholder={dictionary.auth.emailPlaceholder}
          className="w-full"
        />
      </TextField>

      <TextField className="w-full gap-1.5" invalid={login.isError} required>
        <Label>{dictionary.auth.passwordLabel}</Label>
        <Input
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder={dictionary.auth.passwordPlaceholder}
          className="w-full"
        />
        <FieldError>{login.isError ? dictionary.auth.invalidCredentials : null}</FieldError>
      </TextField>

      <Button
        type="submit"
        variant="primary"
        appearance="fill"
        size="md"
        isDisabled={login.isPending}
        className="mt-2 w-full"
      >
        {login.isPending ? dictionary.auth.signingIn : dictionary.auth.signIn}
      </Button>
    </form>
  );
}
