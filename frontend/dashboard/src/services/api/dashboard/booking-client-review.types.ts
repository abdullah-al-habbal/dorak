import type { z } from "zod";
import type { bookingClientReviewSchema } from "@/services/api/dashboard/booking-client-review.schema";

export type BookingClientReviewInput = z.input<
  typeof bookingClientReviewSchema
>;
