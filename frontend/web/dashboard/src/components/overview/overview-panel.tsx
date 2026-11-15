"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDictionary } from "@/hooks/core/state/use-dictionary";
import { useAuthStore } from "@/store/auth.store";

export function OverviewPanel() {
  const { shell } = useDictionary();
  const profile = useAuthStore((state) => state.profile);
  const name = profile?.display_name ?? profile?.email ?? "";

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
          <Row label={shell.overview.role} value={profile?.role ?? "-"} />
          <Row label={shell.overview.scope} value={profile?.branch_id ?? "-"} />
          <div className="flex items-start justify-between gap-4">
            <span className="text-muted-foreground">{shell.overview.permissions}</span>
            <span className="flex flex-wrap justify-end gap-1">
              {profile?.permissions.length ? (
                profile.permissions.map((permission) => <Badge key={permission} variant="info">{permission}</Badge>)
              ) : (
                <Badge variant="secondary">{shell.overview.none}</Badge>
              )}
            </span>
          </div>
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
