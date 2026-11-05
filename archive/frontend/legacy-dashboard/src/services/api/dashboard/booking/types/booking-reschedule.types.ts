import { z } from "zod";
import { createBookingRescheduleSchema } from "@/services/api/dashboard/booking/schemas/booking-reschedule.schema";

export type BookingRescheduleInput = z.infer<
  ReturnType<typeof createBookingRescheduleSchema>
>;
