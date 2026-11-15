import { describe, expect, it } from "vitest";
import { z } from "zod";

import { NAME_MAX_LENGTH } from "@/config/money-shell/field-limit.constant";
import { nameField } from "@/schemas/fields/name-field.zod";
import { zodOutcome } from "@tests/helpers/zod-outcome.helper";

const MESSAGE = "Enter a name.";
const legacy = z.string().trim().min(1, MESSAGE).max(NAME_MAX_LENGTH, MESSAGE);
const CORPUS = ["Ali", "  Ali  ", "", "   ", "x".repeat(NAME_MAX_LENGTH), "x".repeat(NAME_MAX_LENGTH + 1), ` ${"x".repeat(NAME_MAX_LENGTH)} `, "وسط المدينة", 42];

describe("nameField", () => {
  it.each(CORPUS)("matches the inline rule it replaced for %j", (input) => {
    expect(zodOutcome(nameField(NAME_MAX_LENGTH, MESSAGE), input)).toEqual(zodOutcome(legacy, input));
  });

  it("trims, requires a value and caps the length with one message", () => {
    const field = nameField(NAME_MAX_LENGTH, MESSAGE);
    expect(field.parse("  Ali ")).toBe("Ali");
    expect(zodOutcome(field, " ").messages).toEqual([MESSAGE]);
    expect(zodOutcome(field, "x".repeat(NAME_MAX_LENGTH + 1)).messages).toEqual([MESSAGE]);
  });
});
