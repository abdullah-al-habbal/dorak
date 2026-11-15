"use client";

import type { JSX } from "react";

import { BranchFormBody } from "@/components/branches/branch-form-body";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SkeletonRows } from "@/components/ui/skeleton-row";
import { BrandStatus } from "@/enums/brand-status.enum";
import { useBranchDetail } from "@/hooks/branches/use-branch-detail";
import { useBrandOptions } from "@/hooks/brands/use-brand-options";
import { useI18n } from "@/hooks/core/use-i18n";
import type { Branch } from "@/types/branches/branch.type";

interface BranchFormDialogProps {
  branch?: Branch;
  onClose: () => void;
}

const LOADING_ROWS = 4;
const LOADING_ROW_CLASS = "h-10";
const LOADING_STACK_CLASS = "gap-3";

/**
 * Create, or edit with the full detail (both translations) loaded first so a save never drops the other language.
 * A new branch goes under an approved brand only, so an owner whose brands are all pending gets a waiting state.
 */
export function BranchFormDialog({ branch, onClose }: BranchFormDialogProps): JSX.Element {
  const { dictionary } = useI18n();
  const { branches: t, common } = dictionary;
  const detail = useBranchDetail(branch?.id);
  const brandOptions = useBrandOptions(BrandStatus.Active);
  const creating = branch === undefined;
  const ready = creating ? brandOptions.isSuccess : detail.isSuccess;
  const failed = creating ? brandOptions.isError : detail.isError;
  const awaitingApproval = creating && brandOptions.isSuccess && brandOptions.data.length === 0;

  return (
    <Dialog open onOpenChange={(open) => (open ? undefined : onClose())}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto overscroll-contain sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{creating ? t.form.createTitle : t.form.editTitle}</DialogTitle>
          <DialogDescription>{t.form.description}</DialogDescription>
        </DialogHeader>
        {failed ? <ErrorState title={t.states.formErrorTitle} body={t.states.errorBody} onRetry={() => (creating ? brandOptions.refetch() : detail.refetch())} /> : null}
        {!failed && !ready ? (
          <SkeletonRows count={LOADING_ROWS} rowClassName={LOADING_ROW_CLASS} className={LOADING_STACK_CLASS} />
        ) : null}
        {awaitingApproval ? (
          <EmptyState
            title={t.form.awaitingApproval.title}
            body={t.form.awaitingApproval.body}
            action={<Button variant="outline" onClick={onClose}>{common.close}</Button>}
          />
        ) : null}
        {ready && !awaitingApproval ? <BranchFormBody branch={detail.data} brands={brandOptions.data ?? []} onClose={onClose} /> : null}
      </DialogContent>
    </Dialog>
  );
}
