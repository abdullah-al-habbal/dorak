"use client";

import { useState } from "react";
import type { JSX } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { FormField } from "@/components/common/form-field";
import { NativeSelect } from "@/components/ui/native-select";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { SpecialDaysSection } from "@/components/working-hours/special-days-section";
import { WorkingHoursEditor } from "@/components/working-hours/working-hours-editor";
import { AuthActor } from "@/enums/access/auth-actor.enum";
import { useBranchOptions } from "@/hooks/branches/use-branch-options";
import { useI18n } from "@/hooks/core/state/use-i18n";
import { useOpeningHours } from "@/hooks/hours/use-opening-hours";
import { hasSavedHours } from "@/lib/hours/opening-hours.util";
import { useAuthStore } from "@/store/auth.store";

export function WorkingHoursScreen({ actor }: { actor: AuthActor }): JSX.Element {
  const { dictionary } = useI18n();
  if (actor === AuthActor.Barber) {
    const { states } = dictionary.workingHours;
    return <EmptyState variant="forbidden" title={states.forbiddenTitle} body={states.forbiddenBody} />;
  }
  return <WorkingHoursContent />;
}

function WorkingHoursContent(): JSX.Element {
  const { dictionary } = useI18n();
  const t = dictionary.workingHours;
  const ownBranchId = useAuthStore((state) => state.profile?.branch_id ?? null);
  const options = useBranchOptions(ownBranchId === null);
  const [picked, setPicked] = useState<string | null>(null);
  const branches = options.data ?? [];
  const branchId = ownBranchId ?? picked ?? branches[0]?.id ?? null;
  const hours = useOpeningHours(branchId);

  const choosingBranch = ownBranchId === null;
  const noBranch = choosingBranch && options.isSuccess && branches.length === 0;
  const loading = (choosingBranch && options.isPending) || (branchId !== null && hours.isPending);
  const failed = options.isError || hours.isError;
  const retry = (): void => {
    if (options.isError) void options.refetch();
    if (hours.isError) void hours.refetch();
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-semibold">{t.title}</h1>
        <p className="max-w-prose text-sm text-muted-foreground">{t.description}</p>
      </div>

      {choosingBranch && branches.length > 1 ? (
        <FormField id="working-hours-branch" label={t.branch}>
          <NativeSelect id="working-hours-branch" value={branchId ?? ""} onChange={(event) => setPicked(event.target.value)} className="sm:max-w-xs">
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
          </NativeSelect>
        </FormField>
      ) : null}

      {loading ? <TableSkeleton /> : null}
      {failed ? <ErrorState title={t.states.errorTitle} body={t.states.errorBody} onRetry={retry} /> : null}
      {noBranch ? <EmptyState title={t.states.noBranchTitle} body={t.states.noBranchBody} /> : null}
      {branchId !== null && hours.data ? (
        <>
          {!hasSavedHours(hours.data) ? <p role="note" className="rounded-lg bg-warning/15 px-3 py-2 text-sm">{t.notConfigured}</p> : null}
          <WorkingHoursEditor key={branchId} branchId={branchId} initial={hours.data} />
          <SpecialDaysSection key={`special-${branchId}`} branchId={branchId} />
        </>
      ) : null}
    </div>
  );
}
