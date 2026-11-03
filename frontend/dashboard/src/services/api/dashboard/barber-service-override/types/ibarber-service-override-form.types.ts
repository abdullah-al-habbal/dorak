import { z } from "zod";
import { barberServiceOverrideFormSchema } from "@/services/api/dashboard/barber-service-override/schemas/barber-service-override-form.schema";

export type IBarberServiceOverrideForm = z.infer<
  typeof barberServiceOverrideFormSchema
>;
export type IBarberServiceOverrideFormInput = z.input<
  typeof barberServiceOverrideFormSchema
>;
