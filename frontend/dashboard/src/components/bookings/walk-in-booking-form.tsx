"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import { useDashboardListOptions } from "@/hooks/use-dashboard-list-options";
import { useDashboardMutation } from "@/hooks/use-dashboard-mutation";
import { useDictionary } from "@/hooks/use-dictionary";
import { useI18n } from "@/hooks/use-i18n";
import { localizedName } from "@/utils/localized-name.util";
import { useSession } from "@/hooks/use-session";
import {
  mapBranch,
  mapChair,
  mapService,
} from "@/services/api/dashboard/shared/dashboard-mapper.util";
import { mapWalkInBookingPayload } from "@/services/api/dashboard/shared/dashboard-payload-mapper.util";
import { createWalkInBooking } from "@/services/api/dashboard/booking/booking.mutation";
import { createWalkInBookingSchema } from "@/services/api/dashboard/booking/schemas/walk-in-booking.schema";
import type { WalkInBookingInput } from "@/services/api/dashboard/booking/types/walk-in-booking.types";
import { apiErrorMessage } from "@/services/api/core/api-error-message.util";
import { ApiClientError } from "@/services/api/core/client-error";
import { notifySuccess } from "@/services/api/core/notifications";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

export function WalkInBookingForm() {
  const dictionary = useDictionary();
  const { locale } = useI18n();
  const copy = dictionary.walkInBooking;
  const schema = createWalkInBookingSchema(dictionary.validation);
  const session = useSession();
  const router = useRouter();
  const form = useForm<WalkInBookingInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      branchId: session.branchId ?? "",
      chairId: "",
      barberId: null,
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      serviceIds: [],
      startsAt: "",
    },
  });
  const branchId = useWatch({ control: form.control, name: "branchId" });
  const chairId = useWatch({ control: form.control, name: "chairId" });
  const serviceIds = useWatch({ control: form.control, name: "serviceIds" });
  const branches = useDashboardListOptions("branches", mapBranch, {
    page: 1,
    perPage: 100,
    keySuffix: "booking-options",
  });
  const chairs = useDashboardListOptions("chairs", mapChair, {
    page: 1,
    perPage: 100,
    keySuffix: "booking-options",
  });
  const services = useDashboardListOptions("services", mapService, {
    page: 1,
    perPage: 100,
    keySuffix: "booking-options",
  });
  const mutation = useDashboardMutation(
    "bookings",
    (value: WalkInBookingInput) =>
      createWalkInBooking(
        mapWalkInBookingPayload({
          ...value,
          startsAt: new Date(value.startsAt).toISOString(),
        }),
      ),
  );
  const failed = (error: unknown) =>
    toast.error(
      error instanceof ApiClientError &&
        error.code === "booking_outside_schedule"
        ? copy.outsideSchedule
        : apiErrorMessage(error, dictionary),
    );
  return (
    <form
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={form.handleSubmit((value) =>
        mutation.mutate(value, {
          onSuccess: () => {
            notifySuccess(copy.success);
            router.push(`/${session.actor}/bookings`);
          },
          onError: failed,
        }),
      )}
    >
      {session.branchId ? (
        <p className="text-text-secondary">
          {copy.branchScope.replace("{branchId}", session.branchId)}
        </p>
      ) : (
        <label className="grid gap-1">
          {copy.branch}
          <Select
            value={branchId}
            onChange={(value) => {
              const nextValue = String(value);
              form.setValue("branchId", nextValue);
              form.setValue("chairId", "");
            }}
          >
            <SelectTrigger>
              <SelectValue />
              <SelectIndicator />
            </SelectTrigger>
            <SelectContent>
              {(branches.data ?? []).map((branch) => (
                <SelectItem id={branch.id} key={branch.id}>
                  {localizedName(branch.name, locale)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
      )}
      <label className="grid gap-1">
        {copy.chair}
        <Select
          value={chairId}
          onChange={(value) => {
            const nextValue = String(value);
            const chair = (chairs.data ?? []).find(
              (item) => item.id === nextValue,
            );
            form.setValue("chairId", nextValue);
            form.setValue("barberId", chair?.barberId ?? null);
          }}
        >
          <SelectTrigger>
            <SelectValue />
            <SelectIndicator />
          </SelectTrigger>
          <SelectContent>
            {(chairs.data ?? [])
              .filter((chair) => chair.branchId === branchId)
              .map((chair) => (
                <SelectItem id={chair.id} key={chair.id}>
                  {chair.label}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </label>
      <label className="grid gap-1">
        {copy.customerName}
        <Input
          {...form.register("customerName")}
          state={form.formState.errors.customerName ? "error" : "default"}
        />
      </label>
      <label className="grid gap-1">
        {copy.customerEmail}
        <Input
          type="email"
          {...form.register("customerEmail")}
          state={form.formState.errors.customerEmail ? "error" : "default"}
        />
      </label>
      <label className="grid gap-1">
        {copy.customerPhone}
        <Input {...form.register("customerPhone")} />
      </label>
      <label className="grid gap-1">
        {copy.appointmentTime}
        <Input
          type="datetime-local"
          {...form.register("startsAt")}
          state={form.formState.errors.startsAt ? "error" : "default"}
        />
      </label>
      <label className="grid gap-1 sm:col-span-2">
        {copy.services}
        <Select
          selectionMode="multiple"
          value={serviceIds}
          onChange={(value) => {
            const nextValue = Array.from(value as Iterable<string>).map(String);
            form.setValue("serviceIds", nextValue);
          }}
        >
          <SelectTrigger>
            <SelectValue />
            <SelectIndicator />
          </SelectTrigger>
          <SelectContent>
            {(services.data ?? [])
              .filter((service) => {
                const brandId = (branches.data ?? []).find(
                  (branch) => branch.id === branchId,
                )?.brandId;
                return (
                  service.serviceableType === "brand" &&
                  service.serviceableId === brandId
                );
              })
              .map((service) => (
                <SelectItem id={service.id} key={service.id}>
                  {localizedName(service.name, locale)}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </label>
      {form.formState.isSubmitted &&
      Object.keys(form.formState.errors).length > 0 ? (
        <p className="text-input-error-focus-border sm:col-span-2" role="alert">
          {dictionary.validation.invalidField}
        </p>
      ) : null}
      <div className="sm:col-span-2">
        <Button type="submit" isDisabled={mutation.isPending}>
          {copy.create}
        </Button>
      </div>
    </form>
  );
}
