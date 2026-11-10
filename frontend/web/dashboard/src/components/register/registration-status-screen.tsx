"use client";

import { CheckCircle2Icon, CircleDashedIcon } from "lucide-react";
import type { JSX } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { useI18n } from "@/hooks/use-i18n";
import { useOwnerBrands } from "@/hooks/use-owner-brands";
import { localizedText } from "@/lib/booking-format.util";
import { REGISTRATION_STEPS, RegistrationStep, currentRegistrationStep, isStepReached } from "@/lib/registration-status.util";
import { cn } from "@/lib/utils";
import type { AdminBrand } from "@/types/admin-brand.type";

export function RegistrationStatusScreen(): JSX.Element {
  const { dictionary } = useI18n();
  const t = dictionary.registerBusiness.status;
  const query = useOwnerBrands();
  const brands = query.data ?? [];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-semibold">{t.title}</h1>
        <p className="max-w-prose text-sm text-muted-foreground">{t.body}</p>
      </div>
      {query.isPending ? <TableSkeleton /> : null}
      {query.isError ? <ErrorState title={t.errorTitle} body={t.errorBody} onRetry={() => query.refetch()} /> : null}
      {query.data && brands.length === 0 ? <EmptyState title={t.emptyTitle} body={t.emptyBody} /> : null}
      {brands.map((brand) => (
        <BrandReview key={brand.id} brand={brand} />
      ))}
    </div>
  );
}

function BrandReview({ brand }: { brand: AdminBrand }): JSX.Element {
  const { locale, dictionary } = useI18n();
  const t = dictionary.registerBusiness.status;
  const current = currentRegistrationStep(brand.status);

  return (
    <section aria-labelledby={`brand-${brand.id}`} className="flex flex-col gap-5 rounded-xl border bg-card p-5">
      <div>
        <p className="text-sm text-muted-foreground">{t.brand}</p>
        <h2 id={`brand-${brand.id}`} dir="auto" className="font-heading text-xl font-semibold">
          {localizedText(brand.name, locale)}
        </h2>
      </div>
      <ol className="flex flex-col gap-3 sm:flex-row sm:gap-6" aria-label={t.title}>
        {REGISTRATION_STEPS.map((step) => {
          const reached = isStepReached(step, current);
          const Icon = reached ? CheckCircle2Icon : CircleDashedIcon;
          return (
            <li key={step} aria-current={step === current ? "step" : undefined} className={cn("flex items-center gap-2 text-sm", reached ? "font-medium text-foreground" : "text-muted-foreground")}>
              <Icon className={cn("size-5", reached ? "text-primary" : "")} aria-hidden />
              {t.steps[step]}
            </li>
          );
        })}
      </ol>
      <p role="status" className="max-w-prose text-sm text-muted-foreground text-pretty">
        {current === RegistrationStep.Approved ? t.approvedNote : t.pendingNote}
      </p>
    </section>
  );
}
