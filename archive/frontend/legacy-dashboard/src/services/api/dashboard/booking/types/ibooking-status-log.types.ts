import { z } from "zod";
import { BookingStatusLogSchema } from "@/services/api/dashboard/shared/schemas/dashboard-entities.schema";

export type IBookingStatusLog = z.infer<typeof BookingStatusLogSchema>;
