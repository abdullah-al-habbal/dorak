"use client";

import { PencilIcon } from "lucide-react";
import type { JSX } from "react";

import { BranchOversightHours } from "@/components/branches/branch-oversight-hours";
import { BranchOversightPeople } from "@/components/branches/branch-oversight-people";
import { BranchOversightReviews } from "@/components/branches/branch-oversight-reviews";
import { BranchStatusBadge } from "@/components/branches/branch-status-badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { OverlayKind } from "@/enums/overlay-kind.enum";
import { useI18n } from "@/hooks/use-i18n";
import { useOverlay } from "@/hooks/use-overlay";
import { localizedText } from "@/lib/booking-format.util";
import type { Branch } from "@/types/branch.type";

interface BranchOversightDialogProps {
  branch: Branch;
  onClose: () => void;
}

/** The platform admin's read-only view of one branch: reviews, hours, invitations and jobs. Chairs, stylists and services have their own screens with a branch filter. */
export function BranchOversightDialog({ branch, onClose }: BranchOversightDialogProps): JSX.Element {
  const { dictionary, locale } = useI18n();
  const { branchOversight: t } = dictionary;
  const overlay = useOverlay();

  return (
    <Dialog open onOpenChange={(open) => (open ? undefined : onClose())}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto overscroll-contain sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle dir="auto">{localizedText(branch.name, locale)}</DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 text-sm">
          <BranchStatusBadge status={branch.status} />
        </div>
        <BranchOversightReviews branchId={branch.id} />
        <BranchOversightHours branchId={branch.id} />
        <BranchOversightPeople branchId={branch.id} />
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>{t.close}</Button>
          <Button type="button" variant="outline" onClick={() => overlay.open({ kind: OverlayKind.BranchForm, branch })}>
            <PencilIcon aria-hidden data-icon="inline-start" />
            {t.edit}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
