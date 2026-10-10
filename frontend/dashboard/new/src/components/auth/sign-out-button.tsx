"use client";

import { Button } from "@/components/tailgrids/core/button";
import { useSignOut } from "@/hooks/use-sign-out";
import { useDictionary } from "@/hooks/use-dictionary";
import { useSession } from "@/hooks/use-session";

export function SignOutButton() {
  const dictionary = useDictionary();
  const signOut = useSignOut(useSession().actor);

  return (
    <Button
      variant="ghost"
      appearance="outline"
      size="sm"
      isDisabled={signOut.isPending}
      onPress={signOut.signOut}
    >
      {dictionary.auth.signOut}
    </Button>
  );
}
