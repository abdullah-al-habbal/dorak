"use client";

import type { JSX } from "react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { ROUTE_ROOT } from "@/config/routes.constant";
import { useDictionary } from "@/hooks/core/state/use-dictionary";

export function NotFoundScreen(): JSX.Element {
  const { errors } = useDictionary();

  return (
    <main id="main" className="mx-auto flex min-h-dvh max-w-md flex-col items-start justify-center gap-3 px-6">
      <p className="tabular font-heading text-6xl font-semibold text-primary">404</p>
      <h1 className="font-heading text-2xl font-semibold">{errors.notFound.title}</h1>
      <p className="text-muted-foreground">{errors.notFound.body}</p>
      <Link href={ROUTE_ROOT} className={buttonVariants({ className: "mt-3" })}>{errors.backToWorkspace}</Link>
    </main>
  );
}
