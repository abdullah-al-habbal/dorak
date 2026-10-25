"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { BarberAppointmentsSection } from "@/components/barber-workspace/barber-appointments-section";
import { BarberCancelBookingDialog } from "@/components/barber-workspace/barber-cancel-booking-dialog";
import { BarberPortfolioCard } from "@/components/barber-workspace/barber-portfolio-card";
import { BarberTravelCard } from "@/components/barber-workspace/barber-travel-card";
import { BarberWorkstationCard } from "@/components/barber-workspace/barber-workstation-card";
import { useDictionary } from "@/hooks/use-dictionary";
import { useDashboardMutation } from "@/hooks/use-dashboard-mutation";
import { useBarberAppointmentsQuery } from "@/hooks/use-barber-appointments-query";
import { useBarberChannel } from "@/hooks/use-barber-channel";
import { useBarberPortfolioQuery } from "@/hooks/use-barber-portfolio-query";
import { useBarberWorkspaceProfileQuery } from "@/hooks/use-barber-workspace-profile-query";
import { useSession } from "@/hooks/use-session";
import { cancelBarberBookingFormSchema } from "@/services/api/barber-workspace/schemas/cancel-barber-booking-form.schema";
import {
  cancelBarberBooking,
  transitionBarberBooking,
  updateBarberWorkstation,
} from "@/services/api/barber-workspace/barber-workspace.mutation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

export function BarberWorkspace() {
  const dictionary = useDictionary();
  const copy = dictionary.barberWorkspace;
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
  const cancelForm = useForm<z.infer<typeof cancelBarberBookingFormSchema>>({
    resolver: zodResolver(cancelBarberBookingFormSchema),
    defaultValues: { cancellationReason: "" },
  });
  const cancel = useDashboardMutation(
    "barber-appointments",
    (value: z.infer<typeof cancelBarberBookingFormSchema>) =>
      cancelBarberBooking(cancellingId ?? "", value.cancellationReason),
  );
  const closeCancelDialog = () => {
    setCancellingId(null);
    cancelForm.reset();
  };

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-title-50">{copy.title}</h1>
        <p className="mt-1 text-sm text-text-secondary">{copy.description}</p>
      </header>
      <div className="grid gap-4 lg:grid-cols-3">
        <BarberWorkstationCard
          title={copy.workstation}
          onlineLabel={copy.online}
          offlineLabel={copy.offline}
          goOnlineLabel={copy.goOnline}
          goOfflineLabel={copy.goOffline}
          online={currentOnline}
          isPending={workstation.isPending}
          onToggle={() =>
            workstation.mutate(undefined, {
              onSuccess: () => setOnline((value) => !value),
            })
          }
        />
        <BarberTravelCard
          title={copy.travel}
          travelRadius={profile.data?.travelRadius}
          unavailableLabel={dictionary.common.status.unavailable}
        />
        <BarberPortfolioCard
          title={copy.portfolio}
          noPortfolioLabel={copy.noPortfolio}
          photos={portfolio.data}
        />
      </div>
      <BarberAppointmentsSection
        title={copy.appointments}
        isPending={appointments.isPending}
        loadingLabel={dictionary.common.status.loading}
        appointmentLabel={dictionary.operations.appointment}
        acceptLabel={copy.transition.accept}
        cancelLabel={copy.cancellation}
        appointments={appointments.data?.items}
        onAccept={(id) => transition.mutate({ id, action: "accept" })}
        onCancelRequest={setCancellingId}
      />
      <BarberCancelBookingDialog
        labels={dictionary.common.dialog}
        isOpen={cancellingId !== null}
        onClose={closeCancelDialog}
        form={cancelForm}
        onSubmit={(value) =>
          cancel.mutate(value, { onSuccess: closeCancelDialog })
        }
        isPending={cancel.isPending}
        titleLabel={copy.cancellation}
        reasonLabel={copy.cancellationReason}
        reasonPlaceholder={copy.cancellationPlaceholder}
        cancelLabel={dictionary.common.actions.cancel}
        confirmLabel={copy.confirmCancellation}
      />
    </section>
  );
}
