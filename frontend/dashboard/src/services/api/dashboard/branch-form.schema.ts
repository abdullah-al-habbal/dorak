import { z } from "zod";

const localizedName = z.object({
  en: z.string().min(2).max(120),
  ar: z.string().min(2).max(120),
});
const localizedText = (max: number) =>
  z
    .object({
      en: z.string().max(max).nullable(),
      ar: z.string().max(max).nullable(),
    })
    .default({ en: null, ar: null });
const coordinate = z.coerce.number().finite();
const time = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
  .nullable();
const openingDay = z
  .object({
    weekday: z.number().int().min(0).max(6),
    isClosed: z.boolean(),
    opensAt: time,
    closesAt: time,
  })
  .refine(
    (day) => day.isClosed || (day.opensAt === null) === (day.closesAt === null),
    { path: ["closesAt"] },
  )
  .refine(
    (day) =>
      day.isClosed ||
      day.opensAt === null ||
      day.closesAt === null ||
      day.closesAt > day.opensAt,
    { path: ["closesAt"] },
  );

export const branchCreateSchema = z.object({
  name: localizedName,
  brandId: z.string().uuid(),
  email: z.string().email().max(255),
  password: z.string().min(12).max(255),
  latitude: coordinate.min(-90).max(90).nullable(),
  longitude: coordinate.min(-180).max(180).nullable(),
  status: z.enum(["pending", "enabled", "disabled"]),
  universe: z.enum(["men", "women", "unisex"]),
  description: localizedText(2000),
  address: localizedText(255),
  openingHours: z.array(openingDay).length(7).optional(),
});

export const branchEditSchema = branchCreateSchema.extend({
  password: z.string().min(12).max(255).optional(),
});
