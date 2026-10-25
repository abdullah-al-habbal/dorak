"use client";

import { Button } from "@/components/tailgrids/core/button";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import { Input } from "@/components/tailgrids/core/input";
import { useDictionary } from "@/hooks/use-dictionary";
import { useDashboardMutation } from "@/hooks/use-dashboard-mutation";
import { useBarberAppointmentsQuery } from "@/hooks/use-barber-appointments-query";
import { useBarberChannel } from "@/hooks/use-barber-channel";
import { useBarberPortfolioQuery } from "@/hooks/use-barber-portfolio-query";
import { useBarberWorkspaceProfileQuery } from "@/hooks/use-barber-workspace-profile-query";
import { useSession } from "@/hooks/use-session";
import {
  cancelBarberBooking,
  transitionBarberBooking,
  updateBarberWorkstation,
} from "@/services/api/barber-workspace.mutation";
import Image from "next/image";
import { useState } from "react";

export function BarberWorkspace() {
  const dictionary = useDictionary();
  const session = useSession();
  useBarberChannel(session.subject);
  const [online, setOnline] = useState(false);
  const appointments = useBarberAppointmentsQuery();
  const profile = useBarberWorkspaceProfileQuery();
  const portfolio = useBarberPortfolioQuery();
  const workstation = useDashboardMutation("barber-workstation", () =>
    updateBarberWorkstation(!online),
  );
  const transition = useDashboardMutation(
    "barber-appointments",
    ({
      id,
      action,
    }: {
      id: string;
      action: "accept" | "start" | "complete" | "no-show";
    }) => transitionBarberBooking(id, action),
  );
  const currentOnline = profile.data?.workstationOnline ?? online;
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const cancel = useDashboardMutation("barber-appointments", () =>
    cancelBarberBooking(cancellingId ?? "", cancellationReason),
  );

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-title-50">
          {dictionary.barberWorkspace.title}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          {dictionary.barberWorkspace.description}
        </p>
      </header>
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-xl border border-border-primary bg-card-primary p-5">
          <h2 className="font-semibold text-title-50">
            {dictionary.barberWorkspace.workstation}
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            {currentOnline
              ? dictionary.barberWorkspace.online
              : dictionary.barberWorkspace.offline}
          </p>
          <Button
            className="mt-4"
            isDisabled={workstation.isPending}
            onPress={() =>
              workstation.mutate(undefined, {
                onSuccess: () => setOnline((value) => !value),
              })
            }
          >
            {currentOnline
              ? dictionary.barberWorkspace.goOffline
              : dictionary.barberWorkspace.goOnline}
          </Button>
        </section>
        <section className="rounded-xl border border-border-primary bg-card-primary p-5">
          <h2 className="font-semibold text-title-50">
            {dictionary.barberWorkspace.travel}
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            {profile.data?.travelRadius ?? dictionary.common.status.unavailable}
          </p>
        </section>
        <section className="rounded-xl border border-border-primary bg-card-primary p-5">
          <h2 className="font-semibold text-title-50">
            {dictionary.barberWorkspace.portfolio}
          </h2>
          {portfolio.data?.length ? (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {portfolio.data.map((photo) => (
                <div
                  className="relative aspect-square overflow-hidden rounded-md"
                  key={photo.id}
                >
                  <Image
                    alt={dictionary.barberWorkspace.portfolio}
                    className="object-cover"
                    fill
                    sizes="(min-width: 1024px) 33vw, 33vw"
                    src={photo.url}
                    unoptimized
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-text-secondary">
              {dictionary.barberWorkspace.noPortfolio}
            </p>
          )}
        </section>
      </div>
      <section className="rounded-xl border border-border-primary bg-card-primary p-5">
        <h2 className="font-semibold text-title-50">
          {dictionary.barberWorkspace.appointments}
        </h2>
        {appointments.isPending ? (
          <p className="mt-3 text-sm text-text-secondary">
            {dictionary.common.status.loading}
          </p>
        ) : null}
        {appointments.data?.items.map((appointment) => (
          <article
            className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border-primary p-4"
            key={appointment.id}
          >
            <div>
              <p className="font-medium text-text-100">
                {dictionary.operations.appointment}
              </p>
              <p className="text-sm text-text-secondary">
                {appointment.timeSlot}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                appearance="outline"
                onPress={() =>
                  transition.mutate({ id: appointment.id, action: "accept" })
                }
              >
                {dictionary.barberWorkspace.transition.accept}
              </Button>
              <Button
                size="sm"
                variant="danger"
                appearance="outline"
                onPress={() => setCancellingId(appointment.id)}
              >
                {dictionary.barberWorkspace.cancellation}
              </Button>
            </div>
          </article>
        ))}
      </section>
      <Dialog
        isOpen={cancellingId !== null}
        onOpenChange={(value) => {
          if (!value) setCancellingId(null);
        }}
        labels={dictionary.common.dialog}
      >
        <DialogHeader>
          <DialogTitle>{dictionary.barberWorkspace.cancellation}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <label className="grid gap-2 text-sm text-text-100">
            {dictionary.barberWorkspace.cancellationReason}
            <Input
              value={cancellationReason}
              onChange={(event) => setCancellationReason(event.target.value)}
              placeholder={dictionary.barberWorkspace.cancellationPlaceholder}
            />
          </label>
        </DialogBody>
        <DialogFooter>
          <Button appearance="outline" onPress={() => setCancellingId(null)}>
            {dictionary.common.actions.cancel}
          </Button>
          <Button
            variant="danger"
            isDisabled={!cancellationReason || cancel.isPending}
            onPress={() =>
              cancel.mutate(undefined, {
                onSuccess: () => {
                  setCancellationReason("");
                  setCancellingId(null);
                },
              })
            }
          >
            {dictionary.barberWorkspace.confirmCancellation}
          </Button>
        </DialogFooter>
      </Dialog>
    </section>
  );
}
