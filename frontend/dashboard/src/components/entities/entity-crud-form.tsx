"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/tailgrids/core/button";
import { BranchOpeningHoursEditor } from "@/components/entities/branch-opening-hours-editor";
import { ChairMaintenanceConflict } from "@/components/entities/chair-maintenance-conflict";
import {
  emptyToNull,
  fieldLabelKey,
} from "@/components/entities/entity-form-field.util";
import { Input } from "@/components/tailgrids/core/input";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import { useDashboardEntityQuery } from "@/hooks/use-dashboard-entity-query";
import { useDashboardListOptions } from "@/hooks/use-dashboard-list-options";
import { useDashboardMutation } from "@/hooks/use-dashboard-mutation";
import { useLookupOptionsQuery } from "@/hooks/use-lookup-options-query";
import { ApiClientError } from "@/services/api/client-error";
import { useDictionary } from "@/hooks/use-dictionary";
import { useSession } from "@/hooks/use-session";
import {
  branchCreateSchema,
  branchEditSchema,
} from "@/services/api/dashboard/branch-form.schema";
import { fullWeek } from "@/services/api/dashboard/branch-opening-hours.util";
import type { IBranch } from "@/services/api/dashboard/ibranch.types";
import { chairConflictBookingIds } from "@/services/api/dashboard/chair-maintenance-conflict.util";
import { chairFormSchema } from "@/services/api/dashboard/chair-form.schema";
import type { IChair } from "@/services/api/dashboard/ichair.types";
import { serviceFormSchema } from "@/services/api/dashboard/service-form.schema";
import type { IService } from "@/services/api/dashboard/iservice.types";
import {
  stylistCreateSchema,
  stylistEditSchema,
} from "@/services/api/dashboard/stylist-form.schema";
import type { IStylist } from "@/services/api/dashboard/istylist.types";
import {
  createDashboardEntity,
  updateDashboardEntity,
} from "@/services/api/dashboard/dashboard-workflow.mutation";
import {
  mapBranch,
  mapChair,
  mapStylist,
} from "@/services/api/dashboard/dashboard-mapper.util";
import type { EditableDashboardResource } from "@/services/api/dashboard/editable-dashboard-resource.types";
import {
  mapBranchPayload,
  mapChairPayload,
  mapServicePayload,
  mapStylistPayload,
} from "@/services/api/dashboard/dashboard-payload-mapper.util";
import { notifySuccess } from "@/services/api/notifications";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

function isBranchData(
  resource: EditableDashboardResource,
  data: unknown,
): data is IBranch {
  return resource === "branches";
}
function isChairData(
  resource: EditableDashboardResource,
  data: unknown,
): data is IChair {
  return resource === "chairs";
}
function isServiceData(
  resource: EditableDashboardResource,
  data: unknown,
): data is IService {
  return resource === "services";
}
function isStylistData(
  resource: EditableDashboardResource,
  data: unknown,
): data is IStylist {
  return resource === "stylists";
}

interface IEntityCrudFormProps {
  resource: EditableDashboardResource;
  id?: string;
}

function schemaFor(resource: EditableDashboardResource, editing: boolean) {
  if (resource === "branches")
    return editing ? branchEditSchema : branchCreateSchema;
  if (resource === "chairs") return chairFormSchema;
  if (resource === "services") return serviceFormSchema;
  return editing ? stylistEditSchema : stylistCreateSchema;
}

function defaultsFor(
  resource: EditableDashboardResource,
  branchId: string | null,
) {
  if (resource === "branches")
    return {
      name: { en: "", ar: "" },
      brandId: "",
      email: "",
      password: "",
      latitude: null,
      longitude: null,
      status: "pending",
      universe: "unisex",
      description: { en: null, ar: null },
      address: { en: null, ar: null },
      openingHours: fullWeek(),
    };
  if (resource === "chairs")
    return {
      label: "",
      branchId: branchId ?? "",
      barberId: null,
      floorZone: "shared",
      status: "available",
      positionX: 0,
      positionY: 0,
      width: 1,
      height: 1,
      rotation: null,
    };
  if (resource === "services")
    return {
      name: { en: "", ar: "" },
      price: 0,
      duration: null,
      currencyId: "",
      active: true,
      atHome: false,
      serviceableId: branchId ?? "",
      serviceableType: "branch",
      catalogItemId: null,
    };
  return {
    name: { en: "", ar: "" },
    email: "",
    phone: null,
    password: "",
    chairId: null,
    status: "pending",
  };
}

function payloadFor(
  resource: EditableDashboardResource,
  value: unknown,
  force = false,
) {
  if (resource === "branches")
    return mapBranchPayload(value as z.infer<typeof branchCreateSchema>);
  if (resource === "chairs")
    return mapChairPayload(value as z.infer<typeof chairFormSchema>, force);
  if (resource === "services")
    return mapServicePayload(value as z.infer<typeof serviceFormSchema>);
  return mapStylistPayload(value as z.infer<typeof stylistCreateSchema>);
}

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
  const [selectValues, setSelectValues] = useState<Record<string, string>>({});
  const existing = useDashboardEntityQuery(resource, editing ? id : undefined);
  useEffect(() => {
    const current = existing.data;
    if (!current) return;
    if (isBranchData(resource, current))
      form.reset({
        name: current.name,
        brandId: current.brandId,
        email: current.email,
        password: "",
        latitude: current.latitude,
        longitude: current.longitude,
        status: current.status,
        universe: current.universe,
        description: emptyToNull(current.description),
        address: emptyToNull(current.address),
        openingHours: fullWeek(current.openingHours),
      });
    if (isChairData(resource, current))
      form.reset({
        label: current.label ?? "",
        branchId: current.branchId,
        barberId: current.barberId,
        floorZone: current.floorZone,
        status: current.status,
        positionX: current.positionX,
        positionY: current.positionY,
        width: current.width,
        height: current.height,
        rotation: current.rotation,
      });
    if (isServiceData(resource, current))
      form.reset({
        name: current.name,
        price: current.price,
        duration: current.duration,
        currencyId: current.currencyId,
        active: current.active,
        atHome: current.atHome,
        serviceableId: current.serviceableId,
        serviceableType: current.serviceableType,
        catalogItemId: current.catalogItemId,
      });
    if (isStylistData(resource, current))
      form.reset({
        name: current.name,
        email: current.email,
        phone: current.phone,
        password: "",
        chairId: current.chairId,
        status: current.status,
      });
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
  const fields =
    resource === "branches"
      ? [
          "name.en",
          "name.ar",
          "brandId",
          "email",
          "password",
          "latitude",
          "longitude",
          "status",
          "universe",
          "description.en",
          "description.ar",
          "address.en",
          "address.ar",
        ]
      : resource === "chairs"
        ? [
            "label",
            "branchId",
            "barberId",
            "floorZone",
            "status",
            "positionX",
            "positionY",
            "width",
            "height",
            "rotation",
          ]
        : resource === "services"
          ? [
              "name.en",
              "name.ar",
              "price",
              "duration",
              "currencyId",
              "serviceableId",
              "serviceableType",
              "catalogItemId",
              "atHome",
            ]
          : [
              "name.en",
              "name.ar",
              "email",
              "phone",
              "password",
              "chairId",
              "status",
            ];
  const optionsFor = (field: string) => {
    if (field === "status" && resource === "branches")
      return [
        ["pending", fieldCopy.pending],
        ["enabled", fieldCopy.enabled],
        ["disabled", fieldCopy.disabled],
      ] as const;
    if (field === "status" && resource === "chairs")
      return [
        ["available", fieldCopy.available],
        ["occupied", fieldCopy.occupied],
        ["maintenance", fieldCopy.maintenance],
      ] as const;
    if (field === "status" && resource === "stylists")
      return [
        ["pending", fieldCopy.pending],
        ["enabled", fieldCopy.enabled],
        ["disabled", fieldCopy.disabled],
      ] as const;
    if (field === "universe")
      return [
        ["men", fieldCopy.men],
        ["women", fieldCopy.women],
        ["unisex", fieldCopy.unisex],
      ] as const;
    if (field === "floorZone")
      return [
        ["men", fieldCopy.men],
        ["women", fieldCopy.women],
        ["shared", fieldCopy.shared],
      ] as const;
    if (field === "serviceableType")
      return [
        ["branch", fieldCopy.branch],
        ["brand", fieldCopy.brand],
        ["barber", fieldCopy.barber],
      ] as const;
    if (field === "brandId")
      return (brands.data ?? []).map((item) => {
        const locked =
          resource === "branches" &&
          !editing &&
          item.branchLimitReached === true;
        return [
          item.id,
          locked
            ? `${item.label} (${fieldCopy.multiBranchRequired})`
            : item.label,
          locked,
        ] as const;
      });
    if (field === "currencyId")
      return (currencies.data ?? []).map(
        (item) => [item.id, item.label] as const,
      );
    if (field === "catalogItemId")
      return [
        ["", fieldCopy.unassigned],
        ...(catalogItems.data ?? []).map(
          (item) => [item.id, item.label] as const,
        ),
      ];
    if (field === "branchId")
      return (branches.data ?? []).map(
        (item) => [item.id, item.name.en ?? item.id] as const,
      );
    if (field === "serviceableId") {
      const ownerType =
        selectValues.serviceableType ??
        existingSelectValues.serviceableType ??
        defaultSelectValues.serviceableType;
      if (ownerType === "brand")
        return (brands.data ?? []).map(
          (item) => [item.id, item.label] as const,
        );
      if (ownerType === "barber")
        return (stylists.data ?? []).map(
          (item) => [item.id, item.name.en ?? item.id] as const,
        );
      return (branches.data ?? []).map(
        (item) => [item.id, item.name.en ?? item.id] as const,
      );
    }
    if (field === "barberId")
      return [
        ["", fieldCopy.unassigned],
        ...(stylists.data ?? []).map(
          (item) => [item.id, item.name.en ?? item.id] as const,
        ),
      ];
    if (field === "chairId")
      return [
        ["", fieldCopy.unassigned],
        ...(chairs.data ?? []).map(
          (item) => [item.id, item.label ?? item.id] as const,
        ),
      ];
    return null;
  };
  const defaultSelectValues = Object.fromEntries(
    Object.entries(
      defaultsFor(resource, session.branchId) as Record<string, unknown>,
    )
      .filter(([, value]) => typeof value === "string")
      .map(([key, value]) => [key, String(value)]),
  );
  const existingSelectValues = Object.fromEntries(
    Object.entries((existing.data ?? {}) as Record<string, unknown>)
      .filter(([, value]) => typeof value === "string" || value === null)
      .map(([key, value]) => [key, value === null ? "" : String(value)]),
  );

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
        <label className="grid gap-2 text-sm text-text-100" key={field}>
          <span>
            {fieldCopy[fieldLabelKey(field) as keyof typeof fieldCopy] ?? field}
          </span>
          {field === "atHome" ? (
            <input type="checkbox" {...form.register("atHome" as never)} />
          ) : optionsFor(field) ? (
            <Select
              value={
                selectValues[field] ??
                existingSelectValues[field] ??
                defaultSelectValues[field] ??
                ""
              }
              onChange={(value) => {
                const nextValue = String(value);
                setSelectValues((current) => ({
                  ...current,
                  [field]: nextValue,
                }));
                form.setValue(
                  field as never,
                  (nextValue === "" ? null : nextValue) as never,
                );
              }}
            >
              <SelectTrigger>
                <SelectValue />
                <SelectIndicator />
              </SelectTrigger>
              <SelectContent>
                {optionsFor(field)?.map((option) => (
                  <SelectItem
                    id={option[0]}
                    key={option[0]}
                    isDisabled={option[2] === true}
                  >
                    {option[1]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              {...form.register(field as never, {
                setValueAs: (value) => (value === "" ? null : value),
              })}
              state={
                form.formState.errors[field as never] ? "error" : "default"
              }
            />
          )}
          {field === "barberId" && form.formState.errors.barberId?.message ? (
            <span className="text-input-error-focus-border" role="alert">
              {String(form.formState.errors.barberId.message)}
            </span>
          ) : null}
        </label>
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
