"use client";

import { Button } from "@/components/tailgrids/core/button";
import type { BarberAppointment } from "@/services/api/barber-workspace/types/barber-workspace.types";

interface IBarberAppointmentsSectionProps {
  title: string;
  isPending: boolean;
  loadingLabel: string;
  appointmentLabel: string;
  acceptLabel: string;
  cancelLabel: string;
  appointments: readonly BarberAppointment[] | undefined;
  onAccept: (id: string) => void;
  onCancelRequest: (id: string) => void;
}

export function BarberAppointmentsSection({
  title,
  isPending,
  loadingLabel,
  appointmentLabel,
  acceptLabel,
  cancelLabel,
  appointments,
  onAccept,
  onCancelRequest,
}: IBarberAppointmentsSectionProps) {
  return (
    <section className="rounded-xl border border-border-primary bg-card-primary p-5">
      <h2 className="font-semibold text-title-50">{title}</h2>
      {isPending ? (
        <p className="mt-3 text-sm text-text-secondary">{loadingLabel}</p>
      ) : null}
      {appointments?.map((appointment) => (
        <article
          className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border-primary p-4"
          key={appointment.id}
        >
          <div>
            <p className="font-medium text-text-100">{appointmentLabel}</p>
            <p className="text-sm text-text-secondary">
              {appointment.timeSlot}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              appearance="outline"
              onPress={() => onAccept(appointment.id)}
            >
              {acceptLabel}
            </Button>
            <Button
              size="sm"
              variant="danger"
              appearance="outline"
              onPress={() => onCancelRequest(appointment.id)}
            >
              {cancelLabel}
            </Button>
          </div>
        </article>
      ))}
    </section>
  );
}
