import type { JSX, ReactNode } from "react";

import { Card } from "@/components/ui/card";

interface AccountSectionProps {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
}

/** One settings group on the account page: heading and description, then its own controls. */
export function AccountSection({ id, title, description, children }: AccountSectionProps): JSX.Element {
  const headingId = `account-${id}-heading`;
  return (
    <Card role="group" aria-labelledby={headingId} className="gap-5 p-(--card-spacing)">
      <div className="flex flex-col gap-1">
        <h2 id={headingId} className="font-heading text-lg font-semibold">{title}</h2>
        <p className="max-w-prose text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </Card>
  );
}
