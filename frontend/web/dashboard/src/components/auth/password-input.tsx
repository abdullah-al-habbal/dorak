"use client";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";
import type { JSX } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDictionary } from "@/hooks/use-dictionary";

interface PasswordInputProps {
  id: string;
  registration: UseFormRegisterReturn;
  autoComplete: "current-password" | "new-password";
  invalid: boolean;
  describedBy?: string;
  placeholder?: string;
}

/** A password field with a show/hide toggle; the toggle keeps the field's own focus order and label. */
export function PasswordInput({ id, registration, autoComplete, invalid, describedBy, placeholder }: PasswordInputProps): JSX.Element {
  const { auth } = useDictionary();
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="relative">
      <Input
        id={id}
        type={revealed ? "text" : "password"}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="pe-11"
        aria-invalid={invalid}
        aria-describedby={describedBy}
        {...registration}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="absolute end-1.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        aria-label={revealed ? auth.hidePassword : auth.showPassword}
        aria-pressed={revealed}
        onClick={() => setRevealed((value) => !value)}
      >
        {revealed ? <EyeOffIcon aria-hidden /> : <EyeIcon aria-hidden />}
      </Button>
    </div>
  );
}
