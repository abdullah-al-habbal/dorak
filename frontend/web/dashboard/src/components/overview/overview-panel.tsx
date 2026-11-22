"use client";

import type { JSX } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDictionary } from "@/hooks/core/state/use-dictionary";
import { useAuthStore } from "@/hooks/core/state/use-auth-store";
import { enumLabel } from "@/lib/core/format/enum-label.util";

export function OverviewPanel(): JSX.Element {
  const { shell, common } = useDictionary();
  const profile = useAuthStore((state) => state.profile);
  const name = profile?.display_name ?? profile?.email ?? "";
  // A branch account is the branch, so its display name is the branch name. Other roles have no branch to show.
  const branchName = profile?.branch_id ? profile.display_name : null;

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-heading text-3xl font-semibold">
          {shell.overview.greeting}
          {name ? `, ${name}` : ""}
        </h1>
        <p className="mt-2 max-w-prose text-muted-foreground">{shell.overview.shellNote}</p>
      </header>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>{shell.overview.sessionTitle}</CardTitle>
          <CardDescription>{profile?.email}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <Row label={shell.overview.role} value={enumLabel(shell.overview.roles, profile?.role, common.unknown, "role")} />
          {branchName ? <Row label={shell.overview.scope} value={branchName} /> : null}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular font-medium">{value}</span>
    </div>
  );
}
