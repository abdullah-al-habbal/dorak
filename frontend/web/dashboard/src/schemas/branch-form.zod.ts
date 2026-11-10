import { z } from "zod";

import {
  BRANCH_MAX_ADDRESS,
  BRANCH_MAX_DESCRIPTION,
  BRANCH_MAX_EMAIL,
  BRANCH_MAX_NAME,
  BRANCH_MAX_PASSWORD,
  BRANCH_MIN_PASSWORD,
  LATITUDE_LIMIT,
  LONGITUDE_LIMIT,
} from "@/config/branch.constant";
import { VenueUniverse } from "@/enums/venue-universe.enum";
import { parseCoordinate } from "@/lib/coordinate.util";
import { emailField } from "@/schemas/fields/email-field.zod";
import { nameField } from "@/schemas/fields/name-field.zod";
import { passwordField } from "@/schemas/fields/password-field.zod";
import type { Dictionary } from "@/types/dictionary.type";

type BranchValidation = Dictionary["branches"]["form"]["validation"];

/** Mirrors `BranchRequest`; messages come from the dictionary so validation reads in the active locale. */
export function createBranchSchema(messages: BranchValidation, creating: boolean) {
  return z.object({
    brand_id: z.string().min(1, messages.brand),
    name_en: nameField(BRANCH_MAX_NAME, messages.name),
    name_ar: nameField(BRANCH_MAX_NAME, messages.name),
    email: emailField(BRANCH_MAX_EMAIL, messages.email),
    password: passwordField({ min: BRANCH_MIN_PASSWORD, max: BRANCH_MAX_PASSWORD, message: messages.password, required: creating }),
    universe: z.enum(VenueUniverse, messages.universe),
    description_en: z.string().trim().max(BRANCH_MAX_DESCRIPTION, messages.description),
    description_ar: z.string().trim().max(BRANCH_MAX_DESCRIPTION, messages.description),
    address_en: z.string().trim().max(BRANCH_MAX_ADDRESS, messages.address),
    address_ar: z.string().trim().max(BRANCH_MAX_ADDRESS, messages.address),
    latitude: z.string().refine((value) => parseCoordinate(value, LATITUDE_LIMIT) !== undefined, messages.latitude),
    longitude: z.string().refine((value) => parseCoordinate(value, LONGITUDE_LIMIT) !== undefined, messages.longitude),
  });
}

export type BranchFormValues = z.input<ReturnType<typeof createBranchSchema>>;
