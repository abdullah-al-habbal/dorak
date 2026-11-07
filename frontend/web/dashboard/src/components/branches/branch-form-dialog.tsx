"use client";

import type { JSX } from "react";

import { BranchFormBody } from "@/components/branches/branch-form-body";
import { ErrorState } from "@/components/common/error-state";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useBranchDetail } from "@/hooks/use-branch-detail";
import { useBrandOptions } from "@/hooks/use-brand-options";
import { useI18n } from "@/hooks/use-i18n";
import type { Branch } from "@/types/branch.type";

interface BranchFormDialogProps {
  branch?: Branch;
  onClose: () => void;
}

const LOADING_ROWS = 4;

/** Create, or edit with the full detail (both translations) loaded first so a save never drops the other language. */
export function BranchFormDialog({ branch, onClose }: BranchFormDialogProps): JSX.Element {
  const { dictionary } = useI18n();
  const { branches: t } = dictionary;
  const detail = useBranchDetail(branch?.id);
  const brandOptions = useBrandOptions();
  const creating = branch === undefined;
  const ready = creating ? brandOptions.isSuccess : detail.isSuccess;
  const failed = creating ? brandOptions.isError : detail.isError;

  return (
    <Dialog open onOpenChange={(open) => (open ? undefined : onClose())}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto overscroll-contain sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{creating ? t.form.createTitle : t.form.editTitle}</DialogTitle>
          <DialogDescription>{t.form.description}</DialogDescription>
        </DialogHeader>
        {failed ? <ErrorState title={t.states.formErrorTitle} body={t.states.errorBody} onRetry={() => (creating ? brandOptions.refetch() : detail.refetch())} /> : null}
        {!failed && !ready ? (
          <div aria-busy className="flex flex-col gap-3">
            {Array.from({ length: LOADING_ROWS }, (_, index) => <Skeleton key={index} className="h-10 w-full" />)}
          </div>
        ) : null}
        {ready ? <BranchFormBody branch={detail.data} brands={brandOptions.data ?? []} onClose={onClose} /> : null}
      </DialogContent>
    </Dialog>
  );
}
