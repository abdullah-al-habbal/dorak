import type { JSX } from "react";

import { LoadingButton } from "@/components/buttons/loading-button";
import { Button } from "@/components/ui/button";
import { useDictionary } from "@/hooks/core/state/use-dictionary";

interface WorkingHoursSaveBarProps {
  dirty: boolean;
  blocked: boolean;
  saving: boolean;
  onSave: () => void;
  onDiscard: () => void;
}

/** Stays at the bottom of the viewport so Save is reachable from any day of a long week. */
export function WorkingHoursSaveBar({ dirty, blocked, saving, onSave, onDiscard }: WorkingHoursSaveBarProps): JSX.Element {
  const { workingHours: t } = useDictionary();
  const status = blocked ? t.issues.summary : dirty ? t.unsaved : "";
  return (
    <div className="sticky bottom-0 z-10 flex flex-wrap items-center gap-3 border-t border-border bg-background/95 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
      <p role="status" className={blocked ? "me-auto text-sm text-destructive" : "me-auto text-sm text-muted-foreground"}>
        {status}
      </p>
      <Button type="button" variant="ghost" disabled={!dirty || saving} onClick={onDiscard}>
        {t.discard}
      </Button>
      <LoadingButton type="button" loading={saving} disabled={!dirty || blocked} onClick={onSave}>
        {t.save}
      </LoadingButton>
    </div>
  );
}
