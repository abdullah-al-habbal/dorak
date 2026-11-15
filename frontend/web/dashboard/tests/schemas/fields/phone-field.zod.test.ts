import { describe, expect, it } from "vitest";
import { z } from "zod";

import { PHONE_MAX_LENGTH } from "@/config/money-shell/field-limit.constant";
import { phoneField } from "@/schemas/fields/phone-field.zod";
import { zodOutcome } from "@tests/helpers/zod-outcome.helper";

const legacy = z.string().trim().max(PHONE_MAX_LENGTH);
const CORPUS = ["", "  ", "+966 50 000 0000", " +966500000000 ", "1".repeat(PHONE_MAX_LENGTH), "1".repeat(PHONE_MAX_LENGTH + 1), 966];

describe("phoneField", () => {
  it.each(CORPUS)("matches the inline rule it replaced for %j", (input) => {
    expect(zodOutcome(phoneField(PHONE_MAX_LENGTH), input)).toEqual(zodOutcome(legacy, input));
  });

  it("is optional and trimmed", () => {
    expect(phoneField(PHONE_MAX_LENGTH).parse("  ")).toBe("");
    expect(phoneField(PHONE_MAX_LENGTH).parse(" +966 ")).toBe("+966");
  });
});
