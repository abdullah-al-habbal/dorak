import { z } from "zod";
import { BarberServiceTermsSchema } from "@/services/api/dashboard/barber-service-override/schemas/barber-service-terms.schema";

export type IBarberServiceTerms = z.infer<typeof BarberServiceTermsSchema>;
