"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { BarberAppointmentsSection } from "@/components/barber-workspace/barber-appointments-section";
import { BarberCancelBookingDialog } from "@/components/barber-workspace/barber-cancel-booking-dialog";
import { BarberDeletePhotoDialog } from "@/components/barber-workspace/barber-delete-photo-dialog";
import { BarberPortfolioCard } from "@/components/barber-workspace/barber-portfolio-card";
import { BarberProfileCard } from "@/components/barber-workspace/barber-profile-card";
import { BarberScheduleCard } from "@/components/barber-workspace/barber-schedule-card";
import { BarberTravelCard } from "@/components/barber-workspace/barber-travel-card";
import { BarberWorkstationCard } from "@/components/barber-workspace/barber-workstation-card";
import { useDictionary } from "@/hooks/use-dictionary";
import { useBarberMutation } from "@/hooks/use-barber-mutation";
import { useBarberAppointmentsQuery } from "@/hooks/use-barber-appointments-query";
import { useBarberChannel } from "@/hooks/use-barber-channel";
import { useBarberPortfolioQuery } from "@/hooks/use-barber-portfolio-query";
import { useBarberScheduleQuery } from "@/hooks/use-barber-schedule-query";
import { useBarberWorkspaceProfileQuery } from "@/hooks/use-barber-workspace-profile-query";
import { useSession } from "@/hooks/use-session";
import {
  UpdateBarberProfileFormSchema,
  UpdateScheduleFormSchema,
  UpdateTravelRadiusFormSchema,
} from "@/services/api/barber-workspace/schemas/barber-workspace.schema";
import { cancelBarberBookingFormSchema } from "@/services/api/barber-workspace/schemas/cancel-barber-booking-form.schema";
import {
  cancelBarberBooking,
  deleteBarberPortfolioPhoto,
  transitionBarberBooking,
  updateBarberProfile,
  updateBarberSchedule,
  updateBarberTravelRadius,
  updateBarberWorkstation,
  uploadBarberPortfolioPhoto,
} from "@/services/api/barber-workspace/barber-workspace.mutation";
import type { BarberAppointmentAction } from "@/services/api/barber-workspace/types/barber-workspace.types";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

const WEEK_LENGTH = 7;

export function BarberWorkspace() {
  const dictionary = useDictionary();
  const copy = dictionary.barberWorkspace;
  const session = useSession();
  useBarberChannel(session.subject);
  const appointments = useBarberAppointmentsQuery();
  const profile = useBarberWorkspaceProfileQuery();
  const portfolio = useBarberPortfolioQuery();
  const schedule = useBarberScheduleQuery();
  const currentOnline = profile.data?.workstationOnline ?? false;

  const workstation = useBarberMutation("profile", () =>
    updateBarberWorkstation(!currentOnline),
  );
  const transition = useBarberMutation(
    "appointments",
    ({ id, action }: { id: string; action: BarberAppointmentAction }) =>
      transitionBarberBooking(id, action),
  );
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const cancelForm = useForm<z.infer<typeof cancelBarberBookingFormSchema>>({
    resolver: zodResolver(cancelBarberBookingFormSchema),
    defaultValues: { cancellationReason: "" },
  });
  const cancel = useBarberMutation(
    "appointments",
    (value: z.infer<typeof cancelBarberBookingFormSchema>) =>
      cancelBarberBooking(cancellingId ?? "", value.cancellationReason),
  );
  const closeCancelDialog = () => {
    setCancellingId(null);
    cancelForm.reset();
  };

  const scheduleForm = useForm<z.infer<typeof UpdateScheduleFormSchema>>({
    resolver: zodResolver(UpdateScheduleFormSchema),
    defaultValues: { schedule: [] },
  });
  useEffect(() => {
    if (!schedule.data) return;
    const byDay = new Map(
      schedule.data.map((entry) => [entry.dayOfWeek, entry]),
    );
    scheduleForm.reset({
      schedule: Array.from({ length: WEEK_LENGTH }, (_, dayOfWeek) => {
        const existing = byDay.get(dayOfWeek);
        return {
          dayOfWeek,
          startTime: existing?.startTime ?? "09:00",
          endTime: existing?.endTime ?? "17:00",
          isActive: existing?.isActive ?? false,
        };
      }),
    });
  }, [schedule.data, scheduleForm]);
  const saveSchedule = useBarberMutation(
    "schedule",
    (value: z.infer<typeof UpdateScheduleFormSchema>) =>
      updateBarberSchedule(value),
  );

  const travelForm = useForm<z.infer<typeof UpdateTravelRadiusFormSchema>>({
    resolver: zodResolver(UpdateTravelRadiusFormSchema),
    defaultValues: { travelRadius: null },
  });
  useEffect(() => {
    if (profile.data) {
      travelForm.reset({ travelRadius: profile.data.travelRadius ?? null });
    }
  }, [profile.data, travelForm]);
  const saveTravelRadius = useBarberMutation(
    "profile",
    (value: z.infer<typeof UpdateTravelRadiusFormSchema>) =>
      updateBarberTravelRadius(value),
  );

  const profileForm = useForm<z.infer<typeof UpdateBarberProfileFormSchema>>({
    resolver: zodResolver(UpdateBarberProfileFormSchema),
    defaultValues: { bioEn: "", bioAr: "" },
  });
  const saveProfile = useBarberMutation(
    "profile",
    (value: z.infer<typeof UpdateBarberProfileFormSchema>) =>
      updateBarberProfile(value),
  );

  const uploadPhoto = useBarberMutation("portfolio", (file: File) =>
    uploadBarberPortfolioPhoto(file),
  );
  const deletePhoto = useBarberMutation("portfolio", (id: string) =>
    deleteBarberPortfolioPhoto(id),
  );
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);

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
          onToggle={() => workstation.mutate(undefined)}
        />
        <BarberTravelCard
          title={copy.travel}
          editLabel={copy.editTravelRadius}
          saveLabel={copy.save}
          form={travelForm}
          isPending={saveTravelRadius.isPending}
          onSubmit={(value) =>
            saveTravelRadius.mutate(value, {
              onSuccess: () => toast.success(copy.saveTravelRadius),
            })
          }
        />
        <BarberPortfolioCard
          title={copy.portfolio}
          noPortfolioLabel={copy.noPortfolio}
          uploadLabel={copy.uploadPhoto}
          deleteLabel={copy.deletePhoto}
          photos={portfolio.data}
          isUploading={uploadPhoto.isPending}
          onUpload={(file) =>
            uploadPhoto.mutate(file, {
              onSuccess: () => toast.success(copy.photoUploaded),
            })
          }
          onDelete={setDeletingPhotoId}
        />
      </div>
      <BarberScheduleCard
        title={copy.schedule}
        noScheduleLabel={copy.noSchedule}
        activeLabel={copy.active}
        startTimeLabel={copy.startTime}
        endTimeLabel={copy.endTime}
        saveLabel={copy.save}
        weekdayLabels={dictionary.operations.field.weekdays}
        form={scheduleForm}
        isPending={saveSchedule.isPending}
        isLoading={schedule.isPending}
        onSubmit={(value) =>
          saveSchedule.mutate(value, {
            onSuccess: () => toast.success(copy.saveSchedule),
          })
        }
      />
      <BarberProfileCard
        title={copy.editProfile}
        bioEnLabel={copy.bioEn}
        bioArLabel={copy.bioAr}
        saveLabel={copy.save}
        form={profileForm}
        isPending={saveProfile.isPending}
        onSubmit={(value) =>
          saveProfile.mutate(value, {
            onSuccess: () => toast.success(copy.saveProfile),
          })
        }
      />
      <BarberAppointmentsSection
        title={copy.appointments}
        isPending={appointments.isPending}
        loadingLabel={dictionary.common.status.loading}
        appointmentLabel={dictionary.operations.appointment}
        acceptLabel={copy.transition.accept}
        startLabel={copy.transition.start}
        completeLabel={copy.transition.complete}
        noShowLabel={copy.transition.noShow}
        cancelLabel={copy.cancellation}
        appointments={appointments.data?.items}
        onTransition={(id, action) => transition.mutate({ id, action })}
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
      <BarberDeletePhotoDialog
        labels={dictionary.common.dialog}
        isOpen={deletingPhotoId !== null}
        onClose={() => setDeletingPhotoId(null)}
        onConfirm={() =>
          deletePhoto.mutate(deletingPhotoId ?? "", {
            onSuccess: () => {
              toast.success(copy.photoDeleted);
              setDeletingPhotoId(null);
            },
          })
        }
        isPending={deletePhoto.isPending}
        titleLabel={copy.confirmDeletePhoto}
        cancelLabel={dictionary.common.actions.cancel}
        confirmLabel={copy.deletePhoto}
      />
    </section>
  );
}
