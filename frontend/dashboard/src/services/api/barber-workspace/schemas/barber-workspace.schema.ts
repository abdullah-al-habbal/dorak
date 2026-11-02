import { z } from "zod";

export const BarberAppointmentSchema = z.object({
  id: z.string(),
  status: z.string(),
  startsAt: z.string(),
  chair: z.object({ label: z.string().nullable() }).nullable().optional(),
});

export const BarberWorkspaceProfileSchema = z.object({
  isWorkstationOnline: z.boolean().optional(),
  travelRadiusKm: z.number().nullable().optional(),
  portfolio: z
    .array(
      z.object({
        id: z.string(),
        url: z.string().optional(),
        path: z.string().optional(),
      }),
    )
    .optional(),
});

export const UpdateWorkstationStatusInputSchema = z.object({
  online: z.boolean(),
});

export const TransitionBookingInputSchema = z.object({
  transition: z.enum(["accept", "start", "complete", "no-show"]),
});

export const CancelBookingInputSchema = z.object({
  cancellation_reason: z.string(),
});

export const BarberScheduleEntrySchema = z.object({
  id: z.string().optional(),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  isActive: z.boolean(),
});

export const UpdateScheduleFormSchema = z.object({
  schedule: z
    .array(
      z.object({
        dayOfWeek: z.number().int().min(0).max(6),
        startTime: z.string().regex(/^\d{2}:\d{2}$/, "HH:mm"),
        endTime: z.string().regex(/^\d{2}:\d{2}$/, "HH:mm"),
        isActive: z.boolean(),
      }),
    )
    .min(1),
});

export const UpdateTravelRadiusFormSchema = z.object({
  travelRadiusKm: z.number().min(0).max(100).nullable(),
});

export const UpdateBarberProfileFormSchema = z.object({
  bioEn: z.string().max(2000).optional(),
  bioAr: z.string().max(2000).optional(),
});
