"use client";

import { PauseIcon, PlayIcon, PowerIcon, PowerOffIcon } from "lucide-react";
import type { JSX } from "react";

import { Button } from "@/components/ui/button";
import { AuthActor } from "@/enums/access/auth-actor.enum";
import { BranchLifecycleAction } from "@/enums/venue/branch-lifecycle-action.enum";
import { BranchStatus } from "@/enums/venue/branch-status.enum";
import { OverlayKind } from "@/enums/ui/overlay-kind.enum";
import { useBranchLifecycle } from "@/hooks/branches/use-branch-lifecycle";
import { useI18n } from "@/hooks/core/state/use-i18n";
import { useOverlay } from "@/hooks/core/state/use-overlay";
import { localizedText } from "@/lib/core/format/booking-format.util";
import type { Branch } from "@/types/branches/branch.type";

interface BranchLifecycleActionsProps {
  branch: Branch;
  actor: AuthActor;
}

/** D9: owners switch a branch on or off; only the platform admin suspends and reactivates one. */
export function BranchLifecycleActions({ branch, actor }: BranchLifecycleActionsProps): JSX.Element | null {
  const { dictionary, locale } = useI18n();
  const { branches: t } = dictionary;
  const overlay = useOverlay();
  const { mutateAsync: transition } = useBranchLifecycle();
  const name = localizedText(branch.name, locale);

  function confirm(action: BranchLifecycleAction): void {
    const copy = t.lifecycle.confirm[action];
    overlay.open({
      kind: OverlayKind.Confirm,
      title: copy.title,
      description: copy.body.replace("{branch}", name),
      confirmLabel: copy.confirm,
      destructive: action === BranchLifecycleAction.SwitchOff,
      onConfirm: async () => {
        await transition({ id: branch.id, action });
      },
    });
  }

  if (actor === AuthActor.Admin) {
    return branch.status === BranchStatus.Suspended ? (
      <Button size="sm" variant="outline" aria-label={t.lifecycle.row.reactivate.replace("{branch}", name)} onClick={() => confirm(BranchLifecycleAction.Reactivate)}>
        <PlayIcon aria-hidden data-icon="inline-start" />
        {t.lifecycle.reactivate}
      </Button>
    ) : (
      <Button size="sm" variant="ghost" aria-label={t.lifecycle.row.suspend.replace("{branch}", name)} onClick={() => overlay.open({ kind: OverlayKind.BranchSuspend, branch })}>
        <PauseIcon aria-hidden data-icon="inline-start" />
        {t.lifecycle.suspend}
      </Button>
    );
  }
  if (branch.status === BranchStatus.Suspended) return <span className="text-xs text-muted-foreground">{t.lifecycle.suspendedNote}</span>;
  return branch.status === BranchStatus.Enabled ? (
    <Button size="sm" variant="ghost" aria-label={t.lifecycle.row.switchOff.replace("{branch}", name)} onClick={() => confirm(BranchLifecycleAction.SwitchOff)}>
      <PowerOffIcon aria-hidden data-icon="inline-start" />
      {t.lifecycle.switchOff}
    </Button>
  ) : (
    <Button size="sm" variant="outline" aria-label={t.lifecycle.row.switchOn.replace("{branch}", name)} onClick={() => confirm(BranchLifecycleAction.SwitchOn)}>
      <PowerIcon aria-hidden data-icon="inline-start" />
      {t.lifecycle.switchOn}
    </Button>
  );
}
