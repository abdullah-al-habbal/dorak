import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import type { JSX } from "react";

import { loginRoute } from "@/config/routes.constant";
import type { AuthActor } from "@/enums/auth-actor.enum";
import { useDictionary } from "@/hooks/use-dictionary";

export function BackToSignIn({ actor }: { actor: AuthActor }): JSX.Element {
  const { passwordReset } = useDictionary();
  return (
    <Link href={loginRoute(actor)} className="inline-flex items-center gap-1.5 font-medium text-foreground underline-offset-4 hover:underline">
      <ArrowLeftIcon className="size-4 rtl:rotate-180" aria-hidden />
      {passwordReset.backToSignIn}
    </Link>
  );
}
