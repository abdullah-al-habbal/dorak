"use client";

import { useEffect, useSyncExternalStore } from "react";

import { buttonVariants } from "@/components/ui/button";
import { LOCALE_COOKIE } from "@/config/cookies.constant";
import { ROUTE_ROOT } from "@/config/routes.constant";
import { errorReference } from "@/lib/core/error-view.util";
import { readClientCookie } from "@/lib/core/cookie.util";
import { globalErrorView } from "@/lib/core/global-error-copy.util";

import "@/app/globals.css";

const subscribeNothing = () => () => {};

function useGlobalErrorView() {
  // The server render has no cookie to read, so it uses the default; the client then switches without a hydration mismatch.
  const clientKey = useSyncExternalStore(
    subscribeNothing,
    () => `${readClientCookie(LOCALE_COOKIE) ?? ""}|${navigator.language}`,
    () => "|",
  );
  const [cookieValue, language] = clientKey.split("|");
  return globalErrorView(cookieValue || undefined, language || undefined);
}

/** Replaces the root layout when it fails, so it brings its own <html> and <body>. */
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  const view = useGlobalErrorView();
  const reference = errorReference(error);

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang={view.locale} dir={view.direction} suppressHydrationWarning className="h-full">
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <main role="alert" className="mx-auto flex min-h-dvh max-w-md flex-col items-start justify-center gap-3 px-6">
          <h1 className="text-2xl font-semibold">{view.title}</h1>
          <p className="text-muted-foreground">{view.body}</p>
          {reference ? (
            <p className="text-sm text-muted-foreground">
              {view.reference}: <code translate="no" className="select-all font-mono">{reference}</code>
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={retry} className={buttonVariants()}>{view.retry}</button>
            <a href={ROUTE_ROOT} className={buttonVariants({ variant: "outline" })}>{view.home}</a>
          </div>
        </main>
      </body>
    </html>
  );
}
