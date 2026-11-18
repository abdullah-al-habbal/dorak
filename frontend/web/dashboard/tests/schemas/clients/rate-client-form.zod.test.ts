import { describe, expect, it } from "vitest";

import { CLIENT_RATING_BODY_MAX } from "@/config/venue/client-rating.constant";
import { enDictionary } from "@/locales/en/index.constant";
import { createRateClientFormSchema } from "@/schemas/clients/rate-client-form.zod";

const messages = enDictionary.bookings.rateClient;
const schema = createRateClientFormSchema(messages);

describe("rate client form schema", () => {
  it("accepts one to five stars with or without a note", () => {
    expect(schema.safeParse({ rating: 1, body: "" }).success).toBe(true);
    expect(schema.safeParse({ rating: 5, body: "Great" }).success).toBe(true);
  });

  it("asks for a rating when no star is chosen or the value is out of range", () => {
    for (const rating of [0, 6, 2.5]) {
      const issues = schema.safeParse({ rating, body: "" }).error?.issues ?? [];
      expect(issues.map((issue) => [issue.path[0], issue.message])).toEqual([["rating", messages.ratingRequired]]);
    }
  });

  it("limits the note length", () => {
    expect(schema.safeParse({ rating: 3, body: "x".repeat(CLIENT_RATING_BODY_MAX + 1) }).success).toBe(false);
  });
});
