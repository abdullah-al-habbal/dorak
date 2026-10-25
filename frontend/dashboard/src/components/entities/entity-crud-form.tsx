"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/tailgrids/core/button";
import { BranchOpeningHoursEditor } from "@/components/entities/branch-opening-hours-editor";
import { ChairMaintenanceConflict } from "@/components/entities/chair-maintenance-conflict";
import { ENTITY_CRUD_FIELDS } from "@/components/entities/entity-crud-fields.constant";
import { EntityCrudFormField } from "@/components/entities/entity-crud-form-field";
import { defaultsFor } from "@/components/entities/entity-crud-defaults.util";
import { optionsFor } from "@/components/entities/entity-crud-field-options.util";
import { payloadFor } from "@/components/entities/entity-crud-payload.util";
import { resetValuesFor } from "@/components/entities/entity-crud-reset-values.util";
import { schemaFor } from "@/components/entities/entity-crud-schema.util";
import type { IEntityCrudFormProps } from "@/components/entities/entity-crud-form.types";
import { useDashboardEntityQuery } from "@/hooks/use-dashboard-entity-query";
import { useDashboardListOptions } from "@/hooks/use-dashboard-list-options";
import { useDashboardMutation } from "@/hooks/use-dashboard-mutation";
import { useLookupOptionsQuery } from "@/hooks/use-lookup-options-query";
import { ApiClientError } from "@/services/api/client-error";
import { useDictionary } from "@/hooks/use-dictionary";
import { useSession } from "@/hooks/use-session";
import {
  createDashboardEntity,
  updateDashboardEntity,
} from "@/services/api/dashboard/dashboard-workflow.mutation";
import {
  mapBranch,
  mapChair,
  mapStylist,
} from "@/services/api/dashboard/dashboard-mapper.util";
import { chairConflictBookingIds } from "@/services/api/dashboard/chair-maintenance-conflict.util";
import { notifySuccess } from "@/services/api/notifications";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export function EntityCrudForm({ resource, id }: IEntityCrudFormProps) {
  const dictionary = useDictionary();
  const fieldCopy = dictionary.operations.field;
  const session = useSession();
  const router = useRouter();
  const editing = id !== undefined;
  const schema = schemaFor(resource, editing);
  const form = useForm<Record<string, unknown>>({
    resolver: zodResolver(schema) as never,
    defaultValues: defaultsFor(resource, session.branchId) as never,
  });
  const existing = useDashboardEntityQuery(resource, editing ? id : undefined);
  useEffect(() => {
    const current = existing.data;
    if (!current) return;
    const resetValues = resetValuesFor(resource, current);
    if (resetValues) form.reset(resetValues);
  }, [existing.data, form, resource]);
  const [conflictBookingIds, setConflictBookingIds] = useState<string[] | null>(
    null,
  );
  const mutation = useDashboardMutation(
    resource,
    async ({ value, force }: { value: unknown; force: boolean }) => {
      const payload = payloadFor(resource, value, force);
      return editing
        ? updateDashboardEntity(resource, id, payload)
        : createDashboardEntity(resource, payload);
    },
  );
  const submit = (value: unknown, force: boolean) => {
    setConflictBookingIds(null);
    mutation.mutate(
      { value, force },
      {
        onSuccess: () => {
          notifySuccess(
            editing
              ? dictionary.operations.changesSaved
              : dictionary.operations.created,
          );
          router.push(`/${session.actor}/${resource}`);
        },
        onError: (error) => {
          const conflict =
            resource === "chairs" ? chairConflictBookingIds(error) : null;
          if (conflict !== null) setConflictBookingIds(conflict);
          if (
            resource === "chairs" &&
            error instanceof ApiClientError &&
            error.status === 422 &&
            error.errors?.barber_id?.[0]
          ) {
            form.setError("barberId", {
              type: "server",
              message: error.errors.barber_id[0],
            });
          }
        },
      },
    );
  };
  const branches = useDashboardListOptions("branches", mapBranch, {
    page: 1,
    perPage: 100,
    keySuffix: "form-options",
  });
  const chairs = useDashboardListOptions("chairs", mapChair, {
    page: 1,
    perPage: 100,
    keySuffix: "form-options",
  });
  const stylists = useDashboardListOptions("stylists", mapStylist, {
    page: 1,
    perPage: 100,
    keySuffix: "form-options",
  });
  const brands = useLookupOptionsQuery("brands");
  const currencies = useLookupOptionsQuery("currencies");
  const catalogItems = useLookupOptionsQuery("service-catalog-items");
  const fields = ENTITY_CRUD_FIELDS[resource];
  const optionsContext = {
    resource,
    editing,
    fieldCopy,
    lookups: {
      branches: branches.data ?? [],
      chairs: chairs.data ?? [],
      stylists: stylists.data ?? [],
      brands: brands.data ?? [],
      currencies: currencies.data ?? [],
      catalogItems: catalogItems.data ?? [],
    },
    serviceableType: form.watch("serviceableType") as string | undefined,
  };
  if (editing && existing.isPending)
    return (
      <p className="text-text-secondary">{dictionary.operations.loading}</p>
    );
  return (
    <form
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={form.handleSubmit((value) => submit(value, false))}
    >
      {fields.map((field) => (
        <EntityCrudFormField
          key={field}
          field={field}
          fieldCopy={fieldCopy}
          options={optionsFor(field, optionsContext)}
          form={form}
        />
      ))}
      {resource === "branches" ? (
        <BranchOpeningHoursEditor form={form} />
      ) : null}
      {form.formState.isSubmitted &&
      Object.keys(form.formState.errors).length > 0 ? (
        <p className="text-input-error-focus-border sm:col-span-2" role="alert">
          {dictionary.validation.invalidField}
        </p>
      ) : null}
      {conflictBookingIds !== null ? (
        <ChairMaintenanceConflict
          bookingIds={conflictBookingIds}
          canForce={form.getValues("status") === "maintenance"}
          isPending={mutation.isPending}
          onConfirm={() =>
            void form.handleSubmit((value) => submit(value, true))()
          }
        />
      ) : null}
      <div className="sm:col-span-2">
        <Button type="submit" isDisabled={mutation.isPending}>
          {editing ? fieldCopy.saveChanges : dictionary.operations.create}
        </Button>
      </div>
    </form>
  );
}
