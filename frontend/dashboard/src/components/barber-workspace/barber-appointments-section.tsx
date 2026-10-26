"use client";

import { Button } from "@/components/tailgrids/core/button";
import type {
  BarberAppointment,
  BarberAppointmentAction,
} from "@/services/api/barber-workspace/types/barber-workspace.types";

interface IBarberAppointmentsSectionProps {
  title: string;
  isPending: boolean;
  loadingLabel: string;
  appointmentLabel: string;
  acceptLabel: string;
  startLabel: string;
  completeLabel: string;
  noShowLabel: string;
  cancelLabel: string;
  appointments: readonly BarberAppointment[] | undefined;
  onTransition: (id: string, action: BarberAppointmentAction) => void;
  onCancelRequest: (id: string) => void;
}

function actionsForStatus(status: string): BarberAppointmentAction[] {
  switch (status) {
    case "pending":
      return ["accept"];
    case "confirmed":
      return ["start"];
    case "in_progress":
      return ["complete", "no-show"];
    default:
      return [];
  }
}

function canCancel(status: string): boolean {
  return status === "pending" || status === "confirmed";
}

export function BarberAppointmentsSection({
  title,
  isPending,
  loadingLabel,
  appointmentLabel,
  acceptLabel,
  startLabel,
  completeLabel,
  noShowLabel,
  cancelLabel,
  appointments,
  onTransition,
  onCancelRequest,
}: IBarberAppointmentsSectionProps) {
  const transitionLabels: Record<BarberAppointmentAction, string> = {
    accept: acceptLabel,
    start: startLabel,
    complete: completeLabel,
    "no-show": noShowLabel,
  };

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
            {actionsForStatus(appointment.status).map((action) => (
              <Button
                key={action}
                size="sm"
                appearance="outline"
                onPress={() => onTransition(appointment.id, action)}
              >
                {transitionLabels[action]}
              </Button>
            ))}
            {canCancel(appointment.status) ? (
              <Button
                size="sm"
                variant="danger"
                appearance="outline"
                onPress={() => onCancelRequest(appointment.id)}
              >
                {cancelLabel}
              </Button>
            ) : null}
          </div>
        </article>
      ))}
    </section>
  );
}
