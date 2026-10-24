import { z } from "zod";

export const BarberAppointmentSchema = z.object({
  id: z.string(),
  status: z.string(),
  timeSlot: z.string(),
  chair: z.object({ label: z.string().nullable() }).nullable().optional(),
});

export const BarberWorkspaceProfileSchema = z.object({
  workstationOnline: z.boolean().optional(),
  travelRadius: z.number().nullable().optional(),
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
