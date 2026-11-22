import Link from "next/link";
import type { JSX } from "react";

export interface LinkCardItem {
  href: string;
  title: string;
  subtitle?: string;
}

/** Links to other public profiles: branches of a brand, stylists of a branch, workplaces of a stylist. */
export function LinkCardList({ items }: { items: readonly LinkCardItem[] }): JSX.Element {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item.href}>
          <Link href={item.href} className="flex h-full flex-col gap-1 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring">
            <span className="font-medium">{item.title}</span>
            {item.subtitle ? <span className="text-sm text-muted-foreground">{item.subtitle}</span> : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}
