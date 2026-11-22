import type { JSX, ReactNode } from "react";

/** A titled block of a profile; `empty` replaces the content when there is nothing to show. */
export function ProfileSection({ title, empty, children }: { title: string; empty?: string; children?: ReactNode }): JSX.Element {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-heading text-lg font-semibold">{title}</h2>
      {empty ? <p className="rounded-xl border border-dashed border-border-strong bg-card px-4 py-6 text-sm text-muted-foreground">{empty}</p> : children}
    </section>
  );
}
