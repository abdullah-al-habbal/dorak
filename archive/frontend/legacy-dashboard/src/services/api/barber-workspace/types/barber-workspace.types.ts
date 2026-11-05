import { z } from "zod";
import {
  BarberAppointmentSchema,
  BarberWorkspaceProfileSchema,
  UpdateWorkstationStatusInputSchema,
  TransitionBookingInputSchema,
  CancelBookingInputSchema,
  BarberScheduleEntrySchema,
  UpdateScheduleFormSchema,
  UpdateTravelRadiusFormSchema,
  UpdateBarberProfileFormSchema,
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
export type BarberScheduleEntry = z.infer<typeof BarberScheduleEntrySchema>;
export type UpdateScheduleFormInput = z.infer<typeof UpdateScheduleFormSchema>;
export type UpdateTravelRadiusFormInput = z.infer<
  typeof UpdateTravelRadiusFormSchema
>;
export type UpdateBarberProfileFormInput = z.infer<
  typeof UpdateBarberProfileFormSchema
>;

export type BarberAppointmentAction =
  | "accept"
  | "start"
  | "complete"
  | "no-show";
