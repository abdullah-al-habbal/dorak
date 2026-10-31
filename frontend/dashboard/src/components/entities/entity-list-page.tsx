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
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { getDashboardList } from "@/services/api/dashboard/shared/dashboard.query";
import { mapDashboardEntity } from "@/services/api/dashboard/shared/dashboard-entity.util";
import { DASHBOARD_RESOURCE_SEARCH_SUPPORT } from "@/services/api/dashboard/shared/dashboard-resource.constant";
import type { DashboardResource } from "@/services/api/dashboard/shared/types/dashboard-resource.types";
import type { IBooking } from "@/services/api/dashboard/booking/types/ibooking.types";
import type { IStylist } from "@/services/api/dashboard/stylist/types/istylist.types";
import { BookingListFilters } from "@/components/bookings/booking-list-filters";
import type { IBookingListFiltersValue } from "@/components/bookings/booking-list-filters.types";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { BookingActionsDialog } from "@/components/bookings/booking-actions-dialog";
import { EntityDeleteDialog } from "@/components/entities/entity-delete-dialog";
import { StylistActivationToggle } from "@/components/entities/stylist-activation-toggle";
import { useSession } from "@/hooks/use-session";
import { useBranchChannel } from "@/hooks/use-branch-channel";
import Link from "next/link";
import { apiErrorMessage } from "@/services/api/core/api-error-message.util";

interface EntityListPageProps {
  resource: Exclude<DashboardResource, "overview">;
}

const ENTITY_LIST_EMPTY_BOOKING_FILTERS: IBookingListFiltersValue = {
  status: "",
  dateFrom: "",
  dateTo: "",
  chairId: "",
  stylistId: "",
};

export function EntityListPage({ resource }: EntityListPageProps) {
  const config = ENTITY_CONFIGS[resource];
  const dictionary = useDictionary();
  const session = useSession();
  const managerBranchList =
    resource === "branches" && session.actor === "manager";
  useBranchChannel(session.branchId);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [bookingFilters, setBookingFilters] = useState(
    ENTITY_LIST_EMPTY_BOOKING_FILTERS,
  );
  const supportsSearch = DASHBOARD_RESOURCE_SEARCH_SUPPORT[resource];
  const query = useQuery({
    queryKey: [
      "dashboard",
      resource,
      {
        page,
        search: debouncedSearch,
        ...(resource === "bookings" ? bookingFilters : {}),
      },
    ],
    queryFn: async () => {
      const result = await getDashboardList<unknown>(resource, {
        page,
        ...(supportsSearch ? { search: debouncedSearch } : {}),
        ...(resource === "bookings"
          ? {
              status: bookingFilters.status || undefined,
              dateFrom: bookingFilters.dateFrom || undefined,
              dateTo: bookingFilters.dateTo || undefined,
              chairId: bookingFilters.chairId || undefined,
              stylistId: bookingFilters.stylistId || undefined,
            }
          : {}),
      });
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
      {resource === "bookings" ? (
        <BookingListFilters
          value={bookingFilters}
          onChange={(value) => {
            setBookingFilters(value);
            setPage(1);
          }}
        />
      ) : null}
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
                        <>
                          <Link
                            className="text-button-primary-outline-text underline"
                            href={`/${session.actor}/bookings/${item.id}`}
                          >
                            {dictionary.operations.details}
                          </Link>
                          <BookingActionsDialog
                            bookingId={item.id}
                            status={(item as IBooking).status}
                          />
                        </>
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
                          {resource === "stylists" ? (
                            <StylistActivationToggle
                              id={item.id}
                              status={(item as IStylist).status}
                            />
                          ) : null}
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
