import { z } from "zod";
import {
  BarberAppointmentSchema,
  BarberWorkspaceProfileSchema,
  UpdateWorkstationStatusInputSchema,
  TransitionBookingInputSchema,
  CancelBookingInputSchema,
} from "@/services/api/barber-workspace/schemas/barber-workspace.schema";

export type BarberAppointment = z.infer<typeof BarberAppointmentSchema>;
export type BarberWorkspaceProfile = z.infer<
  typeof BarberWorkspaceProfileSchema
>;
export type UpdateWorkstationStatusInput = z.infer<
  typeof UpdateWorkstationStatusInputSchema
>;
export type TransitionBookingInput = z.infer<
  typeof TransitionBookingInputSchema
>;
export type CancelBookingInput = z.infer<typeof CancelBookingInputSchema>;
