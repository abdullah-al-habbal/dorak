"use client";

import { useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";

import { LOCALE_COOKIE } from "@/config/cookies.constant";
import type { Locale } from "@/enums/locale.enum";
import { writeClientCookie } from "@/lib/cookie.util";

export function useLocaleSwitch() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const switchTo = useCallback(
    (locale: Locale) => {
      writeClientCookie(LOCALE_COOKIE, locale);
      startTransition(() => router.refresh());
    },
    [router],
  );

  return { switchTo, pending };
}
