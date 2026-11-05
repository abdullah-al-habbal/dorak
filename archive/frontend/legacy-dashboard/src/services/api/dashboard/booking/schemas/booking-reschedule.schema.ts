import { z } from "zod";

export function createBookingRescheduleSchema(copy: {
  invalidStartTime: string;
  invalidEndTime: string;
  endAfterStart: string;
}) {
  return z
    .object({
      startsAt: z
        .string()
        .min(1)
        .refine(
          (value) => !Number.isNaN(new Date(value).getTime()),
          copy.invalidStartTime,
        ),
      endsAt: z
        .string()
        .min(1)
        .refine(
          (value) => !Number.isNaN(new Date(value).getTime()),
          copy.invalidEndTime,
        ),
    })
    .refine((input) => new Date(input.endsAt) > new Date(input.startsAt), {
      message: copy.endAfterStart,
      path: ["endsAt"],
    });
}
