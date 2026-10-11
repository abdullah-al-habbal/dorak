import { z } from "zod";

export const bookingRescheduleSchema = z
  .object({
    timeSlot: z
      .string()
      .min(1)
      .refine(
        (value) => !Number.isNaN(new Date(value).getTime()),
        "Invalid start time.",
      ),
    endsAt: z
      .string()
      .min(1)
      .refine(
        (value) => !Number.isNaN(new Date(value).getTime()),
        "Invalid end time.",
      ),
  })
  .refine((input) => new Date(input.endsAt) > new Date(input.timeSlot), {
    message: "End time must follow start time.",
    path: ["endsAt"],
  });
