import { describe, expect, it } from "vitest";
import { z } from "zod";

import { EMAIL_MAX_LENGTH } from "@/config/money-shell/field-limit.constant";
import { emailField } from "@/schemas/fields/email-field.zod";
import { zodOutcome } from "@tests/helpers/zod-outcome.helper";

const MESSAGE = "Enter a valid email.";
const LONG_VALID = `${"a".repeat(EMAIL_MAX_LENGTH)}@example.test`;
/** The two inline forms the builder replaced: walk-in and stylist piped, branch chained. */
const legacyPiped = z.string().trim().max(EMAIL_MAX_LENGTH, MESSAGE).pipe(z.email(MESSAGE));
const legacyChained = z.string().trim().email(MESSAGE).max(EMAIL_MAX_LENGTH, MESSAGE);
const CORPUS = ["ali@example.com", "  ali@example.com ", "", "nope", "ali@", LONG_VALID, "x".repeat(EMAIL_MAX_LENGTH + 1), null];

describe("emailField", () => {
  it.each(CORPUS)("matches both inline rules it replaced for %j", (input) => {
    const outcome = zodOutcome(emailField(EMAIL_MAX_LENGTH, MESSAGE), input);
    expect(outcome).toEqual(zodOutcome(legacyPiped, input));
    expect(outcome).toEqual(zodOutcome(legacyChained, input));
  });

  it("trims before validating and reports one message", () => {
    const field = emailField(EMAIL_MAX_LENGTH, MESSAGE);
    expect(field.parse(" ali@example.com ")).toBe("ali@example.com");
    expect(zodOutcome(field, "nope").messages).toEqual([MESSAGE]);
    expect(zodOutcome(field, LONG_VALID).messages).toEqual([MESSAGE]);
  });
});
