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
import { useDashboardMutation } from "@/hooks/use-dashboard-mutation";
import { useDictionary } from "@/hooks/use-dictionary";
import { useSession } from "@/hooks/use-session";
import {
  mapBranch,
  mapChair,
  mapService,
} from "@/services/api/dashboard/dashboard-mapper.util";
import { mapWalkInBookingPayload } from "@/services/api/dashboard/dashboard-payload-mapper.util";
import { getDashboardList } from "@/services/api/dashboard/dashboard.query";
import { createWalkInBooking } from "@/services/api/dashboard/dashboard-workflow.mutation";
import { createWalkInBookingSchema } from "@/services/api/dashboard/walk-in-booking.schema";
import type { WalkInBookingInput } from "@/services/api/dashboard/walk-in-booking.types";
import { notifySuccess } from "@/services/api/notifications";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

export function WalkInBookingForm() {
  const dictionary = useDictionary();
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
      timeSlot: "",
    },
  });
  const [branchId, setBranchId] = useState(session.branchId ?? "");
  const [chairId, setChairId] = useState("");
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const branches = useQuery({
    queryKey: ["dashboard", "branches", "booking-options"],
    queryFn: async () =>
      (
        await getDashboardList<unknown>("branches", { page: 1, perPage: 100 })
      ).items.map(mapBranch),
  });
  const chairs = useQuery({
    queryKey: ["dashboard", "chairs", "booking-options"],
    queryFn: async () =>
      (
        await getDashboardList<unknown>("chairs", { page: 1, perPage: 100 })
      ).items.map(mapChair),
  });
  const services = useQuery({
    queryKey: ["dashboard", "services", "booking-options"],
    queryFn: async () =>
      (
        await getDashboardList<unknown>("services", { page: 1, perPage: 100 })
      ).items.map(mapService),
  });
  const mutation = useDashboardMutation(
    "bookings",
    (value: WalkInBookingInput) =>
      createWalkInBooking(
        mapWalkInBookingPayload({
          ...value,
          timeSlot: new Date(value.timeSlot).toISOString(),
        }),
      ),
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
              setBranchId(nextValue);
              setChairId("");
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
                  {branch.name.en}
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
            setChairId(nextValue);
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
          {...form.register("timeSlot")}
          state={form.formState.errors.timeSlot ? "error" : "default"}
        />
      </label>
      <label className="grid gap-1 sm:col-span-2">
        {copy.services}
        <Select
          selectionMode="multiple"
          value={serviceIds}
          onChange={(value) => {
            const nextValue = Array.from(value as Iterable<string>).map(String);
            setServiceIds(nextValue);
            form.setValue("serviceIds", nextValue);
          }}
        >
          <SelectTrigger>
            <SelectValue />
            <SelectIndicator />
          </SelectTrigger>
          <SelectContent>
            {(services.data ?? [])
              .filter((service) => service.serviceableId === branchId)
              .map((service) => (
                <SelectItem id={service.id} key={service.id}>
                  {service.name.en}
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
