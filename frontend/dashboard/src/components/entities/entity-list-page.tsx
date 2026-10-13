"use client";

import { ENTITY_CONFIGS } from "@/components/entities/entity-config.constant";
import { Input } from "@/components/tailgrids/core/input";
import { Pagination } from "@/components/tailgrids/core/pagination";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/tailgrids/core/table";
import { useDictionary } from "@/hooks/use-dictionary";
import { getDashboardList } from "@/services/api/dashboard/dashboard.query";
import { mapDashboardEntity } from "@/services/api/dashboard/dashboard-entity.util";
import type { DashboardResource } from "@/services/api/dashboard/dashboard-resource.types";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { BookingActionsDialog } from "@/components/bookings/booking-actions-dialog";
import { EntityDeleteDialog } from "@/components/entities/entity-delete-dialog";
import { useSession } from "@/hooks/use-session";
import { useBranchChannel } from "@/hooks/use-branch-channel";
import Link from "next/link";
import { apiErrorMessage } from "@/services/api/api-error-message.util";

interface EntityListPageProps {
  resource: Exclude<DashboardResource, "overview">;
}

export function EntityListPage({ resource }: EntityListPageProps) {
  const config = ENTITY_CONFIGS[resource];
  const dictionary = useDictionary();
  const session = useSession();
  const managerBranchList =
    resource === "branches" && session.actor === "manager";
  useBranchChannel(session.branchId);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const supportsSearch = false;
  const query = useQuery({
    queryKey: ["dashboard", resource, { page, search }],
    queryFn: async () => {
      const result = await getDashboardList<unknown>(
        resource,
        supportsSearch ? { page, search } : { page },
      );
      return {
        ...result,
        items: result.items.map((item) => mapDashboardEntity(resource, item)),
      };
    },
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-title-50">
            {dictionary.common.nav[resource]}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {query.data?.pagination.total ?? 0} {dictionary.operations.records}
          </p>
        </div>
        <div className="flex gap-3">
          {supportsSearch ? (
            <Input
              aria-label={dictionary.operations.searchLabel}
              placeholder={dictionary.common.search.placeholder}
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          ) : null}
          {managerBranchList ? null : resource !== "bookings" ? (
            <Link
              className="rounded-lg bg-button-primary-background px-4 py-2 text-sm text-button-primary-text"
              href={`/${session.actor}/${resource}/create`}
            >
              {dictionary.operations.create}
            </Link>
          ) : (
            <Link
              className="rounded-lg bg-button-primary-background px-4 py-2 text-sm text-button-primary-text"
              href={`/${session.actor}/bookings/create`}
            >
              {dictionary.operations.create}
            </Link>
          )}
        </div>
      </div>
      {query.isPending ? (
        <p className="text-text-secondary">
          {dictionary.common.status.loading}
        </p>
      ) : null}
      {query.isError ? (
        <p className="text-input-error-focus-border" role="alert">
          {apiErrorMessage(query.error, dictionary)}
        </p>
      ) : null}
      {query.data ? (
        <>
          <TableRoot>
            <TableHeader>
              <TableRow>
                {config.columns.map((column) => (
                  <TableHead key={column.id}>
                    {dictionary.operations.field[
                      column.label as keyof typeof dictionary.operations.field
                    ] ?? column.label}
                  </TableHead>
                ))}
                <TableHead>{dictionary.operations.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.data.items.map((item) => (
                <TableRow key={item.id}>
                  {config.columns.map((column) => (
                    <TableCell key={column.id}>
                      {(() => {
                        const value = column.value(item as never);
                        const statusLabels = dictionary.operations.field;
                        return typeof value === "string" &&
                          value in statusLabels
                          ? statusLabels[value as keyof typeof statusLabels]
                          : value;
                      })()}
                    </TableCell>
                  ))}
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {resource === "bookings" ? (
                        <BookingActionsDialog bookingId={item.id} />
                      ) : (
                        <>
                          <Link
                            className="text-button-primary-outline-text underline"
                            href={`/${session.actor}/${resource}/${item.id}`}
                          >
                            {dictionary.operations.details}
                          </Link>
                          <Link
                            className="text-button-primary-outline-text underline"
                            href={`/${session.actor}/${resource}/${item.id}/edit`}
                          >
                            {dictionary.operations.edit}
                          </Link>
                          {managerBranchList ? null : (
                            <EntityDeleteDialog
                              resource={resource}
                              id={item.id}
                            />
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </TableRoot>
          {query.data.items.length === 0 ? (
            <p className="text-text-secondary">{dictionary.operations.empty}</p>
          ) : null}
          <Pagination
            currentPage={query.data.pagination.currentPage}
            totalPages={query.data.pagination.totalPages}
            onPageChange={setPage}
            labels={dictionary.common.pagination}
          />
        </>
      ) : null}
    </section>
  );
}
