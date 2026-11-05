import { z } from "zod";
import { BookingSchema } from "@/services/api/dashboard/shared/schemas/dashboard-entities.schema";

export type IBooking = z.infer<typeof BookingSchema>;
