"use client";

import { ENTITY_CONFIGS } from "@/components/entities/entity-config.constant";
import { useDictionary } from "@/hooks/use-dictionary";
import { getDashboardEntity } from "@/services/api/dashboard/shared/dashboard.query";
import type { OperationsActor } from "@/services/api/auth/types/auth.types";
import type { DashboardResource } from "@/services/api/dashboard/shared/types/dashboard-resource.types";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { apiErrorMessage } from "@/services/api/core/api-error-message.util";
import { ROUTES } from "@/config/routes.constant";

interface EntityDetailPageProps {
  actor: OperationsActor;
  resource: Exclude<DashboardResource, "overview">;
  id: string;
}

export function EntityDetailPage({
  actor,
  resource,
  id,
}: EntityDetailPageProps) {
  const dictionary = useDictionary();
  const query = useQuery({
    queryKey: ["dashboard", resource, id],
    queryFn: () => getDashboardEntity<Record<string, unknown>>(resource, id),
  });
  if (query.isPending)
    return (
      <p className="text-text-secondary">
        {dictionary.operations.loadingDetails}
      </p>
    );
  if (query.isError)
    return (
      <p className="text-input-error-focus-border" role="alert">
        {apiErrorMessage(query.error, dictionary)}
      </p>
    );
  const values = Object.entries(query.data ?? {}).filter(
    ([, value]) => value !== null && typeof value !== "object",
  );
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-title-50">
            {dictionary.operations.details}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {dictionary.common.nav[resource]}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {resource === "stylists" &&
          (actor === "owner" || actor === "admin") ? (
            <Link
              className="rounded-lg border border-button-primary-outline-stroke px-4 py-2 text-sm text-button-primary-outline-text"
              href={ROUTES.operations.stylistPricing(actor, id)}
            >
              {dictionary.barberServiceTerms.pricingLink}
            </Link>
          ) : null}
          <Link
            className="rounded-lg border border-button-primary-outline-stroke px-4 py-2 text-sm text-button-primary-outline-text"
            href={`/${actor}/${resource}`}
          >
            {dictionary.operations.backToList}
          </Link>
        </div>
      </div>
      <dl className="grid gap-4 rounded-xl border border-border-primary bg-card-primary p-5 sm:grid-cols-2">
        {values.map(([key, value]) => (
          <div className="border-b border-border-primary pb-3" key={key}>
            <dt className="text-xs font-medium uppercase tracking-wide text-text-secondary">
              {dictionary.operations.field[
                key.replace(/_([a-z])/g, (_, letter: string) =>
                  letter.toUpperCase(),
                ) as keyof typeof dictionary.operations.field
              ] ?? dictionary.operations.details}
            </dt>
            <dd className="mt-1 text-sm text-text-100">
              {typeof value === "string" && value in dictionary.operations.field
                ? dictionary.operations.field[
                    value as keyof typeof dictionary.operations.field
                  ]
                : String(value)}
            </dd>
          </div>
        ))}
      </dl>
      {ENTITY_CONFIGS[resource].hasEditRoute ? (
        <Link
          className="text-sm text-button-primary-outline-text underline"
          href={`/${actor}/${resource}/${id}/edit`}
        >
          {dictionary.operations.edit}
        </Link>
      ) : null}
    </section>
  );
}
