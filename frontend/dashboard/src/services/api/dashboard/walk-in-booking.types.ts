import { z } from "zod";
import { createWalkInBookingSchema } from "@/services/api/dashboard/walk-in-booking.schema";

export type WalkInBookingInput = z.infer<
  ReturnType<typeof createWalkInBookingSchema>
>;
