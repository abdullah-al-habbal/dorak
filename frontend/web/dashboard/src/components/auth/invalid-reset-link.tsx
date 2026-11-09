import { LinkIcon } from "lucide-react";
import Link from "next/link";
import type { JSX } from "react";

import { buttonVariants } from "@/components/ui/button";
import { forgotPasswordRoute } from "@/config/routes.constant";
import type { AuthActor } from "@/enums/auth-actor.enum";
import { useDictionary } from "@/hooks/use-dictionary";

/** Shown for a link the backend refused, or one missing its token or email. */
export function InvalidResetLink({ actor }: { actor: AuthActor }): JSX.Element {
  const { passwordReset } = useDictionary();
  return (
    <div role="alert" className="flex flex-col gap-4 rounded-xl border bg-card p-5">
      <LinkIcon className="size-6 text-destructive" aria-hidden />
      <div className="flex flex-col gap-1.5">
        <h2 className="font-heading text-lg font-semibold">{passwordReset.reset.invalidTitle}</h2>
        <p className="text-sm text-muted-foreground text-pretty">{passwordReset.reset.invalidBody}</p>
      </div>
      <Link href={forgotPasswordRoute(actor)} className={buttonVariants({ variant: "outline", className: "self-start" })}>
        {passwordReset.reset.requestNew}
      </Link>
    </div>
  );
}
