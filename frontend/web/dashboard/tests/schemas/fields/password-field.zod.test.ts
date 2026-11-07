import { describe, expect, it } from "vitest";
import { z } from "zod";

import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "@/config/field-limit.constant";
import { passwordField } from "@/schemas/fields/password-field.zod";
import { zodOutcome } from "@tests/helpers/zod-outcome.helper";

const MESSAGE = "Use at least 12 characters.";
const LOGIN_MESSAGE = "passwordRequired";
const LOGIN_MIN = 1;
const inRange = (value: string): boolean => value.length >= PASSWORD_MIN_LENGTH && value.length <= PASSWORD_MAX_LENGTH;

/** The inline rules the builder replaced: branch (refine), stylist (min/max) and the login form. */
const legacy = {
  branchCreate: z.string().refine(inRange, MESSAGE),
  branchEdit: z.string().refine((value) => value === "" || inRange(value), MESSAGE),
  stylistCreate: z.string().min(PASSWORD_MIN_LENGTH, MESSAGE).max(PASSWORD_MAX_LENGTH, MESSAGE),
  stylistEdit: z.string().max(PASSWORD_MAX_LENGTH, MESSAGE).refine((value) => value === "" || value.length >= PASSWORD_MIN_LENGTH, MESSAGE),
  login: z.string().min(LOGIN_MIN, { error: LOGIN_MESSAGE }).max(PASSWORD_MAX_LENGTH, { error: LOGIN_MESSAGE }),
};
const create = passwordField({ min: PASSWORD_MIN_LENGTH, max: PASSWORD_MAX_LENGTH, message: MESSAGE, required: true });
const edit = passwordField({ min: PASSWORD_MIN_LENGTH, max: PASSWORD_MAX_LENGTH, message: MESSAGE, required: false });
const login = passwordField({ min: LOGIN_MIN, max: PASSWORD_MAX_LENGTH, message: LOGIN_MESSAGE, required: true });
const CORPUS = [
  "",
  " ",
  "short",
  "x".repeat(PASSWORD_MIN_LENGTH - 1),
  "x".repeat(PASSWORD_MIN_LENGTH),
  `  ${"x".repeat(PASSWORD_MIN_LENGTH - 2)}`,
  "x".repeat(PASSWORD_MAX_LENGTH),
  "x".repeat(PASSWORD_MAX_LENGTH + 1),
  undefined,
];

describe("passwordField", () => {
  it.each(CORPUS)("matches the inline rules it replaced for %j", (input) => {
    expect(zodOutcome(create, input)).toEqual(zodOutcome(legacy.branchCreate, input));
    expect(zodOutcome(create, input)).toEqual(zodOutcome(legacy.stylistCreate, input));
    expect(zodOutcome(edit, input)).toEqual(zodOutcome(legacy.branchEdit, input));
    expect(zodOutcome(edit, input)).toEqual(zodOutcome(legacy.stylistEdit, input));
    expect(zodOutcome(login, input)).toEqual(zodOutcome(legacy.login, input));
  });

  it("keeps whitespace and accepts an empty value only when optional", () => {
    expect(create.parse(` ${"x".repeat(PASSWORD_MIN_LENGTH)} `)).toBe(` ${"x".repeat(PASSWORD_MIN_LENGTH)} `);
    expect(zodOutcome(create, "").messages).toEqual([MESSAGE]);
    expect(edit.parse("")).toBe("");
  });
});
