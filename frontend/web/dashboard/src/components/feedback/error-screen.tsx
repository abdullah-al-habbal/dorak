"use client";

import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { ROUTE_ROOT } from "@/config/routes.constant";
import { useDictionary } from "@/hooks/core/use-dictionary";
import { classifyError, errorReference } from "@/lib/core/error-view.util";

interface ErrorScreenProps {
  error: unknown;
  onRetry: () => void;
  /** Inside the portal shell, which already owns the page's <main>. */
  nested?: boolean;
}

export function ErrorScreen({ error, onRetry, nested = false }: ErrorScreenProps) {
  const { common, errors } = useDictionary();
  const kind = classifyError(error);
  const copy = { generic: errors.generic, unavailable: errors.unavailable, rateLimited: errors.rateLimited, forbidden: errors.forbidden }[kind];
  const reference = errorReference(error);
  const Container = nested ? "section" : "main";

  return (
    <Container
      id={nested ? undefined : "main"}
      role="alert"
      className="mx-auto flex min-h-[60dvh] max-w-md flex-col items-start justify-center gap-3 px-6"
    >
      <h1 className="font-heading text-2xl font-semibold">{copy.title}</h1>
      <p className="text-muted-foreground">{copy.body}</p>
      {reference ? (
        <p className="text-sm text-muted-foreground">
          {errors.reference}: <code translate="no" className="tabular select-all font-mono">{reference}</code>
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <Button onClick={onRetry}>{common.retry}</Button>
        <Link href={ROUTE_ROOT} className={buttonVariants({ variant: "outline" })}>{errors.backToWorkspace}</Link>
      </div>
    </Container>
  );
}
