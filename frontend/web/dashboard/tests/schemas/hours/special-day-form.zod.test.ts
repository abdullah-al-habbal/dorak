import { describe, expect, it } from "vitest";

import { EMPTY_SPECIAL_DAY } from "@/lib/hours/hours-override.util";
import { enDictionary } from "@/locales/en/index.constant";
import { createSpecialDayFormSchema } from "@/schemas/hours/special-day-form.zod";

const messages = enDictionary.workingHours.specialDays.issues;
const schema = createSpecialDayFormSchema(messages);
const FUTURE = "2999-01-10";

function issues(values: object): Array<[PropertyKey, string]> {
  return (schema.safeParse({ ...EMPTY_SPECIAL_DAY, ...values }).error?.issues ?? []).map((issue) => [issue.path[0], issue.message]);
}

describe("special day form schema", () => {
  it("accepts a closed day and a day with hours", () => {
    expect(schema.safeParse({ ...EMPTY_SPECIAL_DAY, date: FUTURE }).success).toBe(true);
    expect(schema.safeParse({ ...EMPTY_SPECIAL_DAY, date: FUTURE, kind: "hours", opens: "10:00", closes: "18:00" }).success).toBe(true);
  });

  it("shows each rule under its own field", () => {
    expect(issues({})).toEqual([["date", messages.date]]);
    expect(issues({ date: "2000-01-01" })).toEqual([["date", messages.past]]);
    expect(issues({ date: FUTURE, endDate: "2999-01-09" })).toEqual([["endDate", messages.range]]);
    expect(issues({ date: FUTURE, weekdays: [5] })).toEqual([["endDate", messages.repeatNeedsEnd]]);
    expect(issues({ date: FUTURE, kind: "hours" })).toEqual([["opens", messages.times]]);
    expect(issues({ date: FUTURE, kind: "hours", opens: "18:00", closes: "10:00" })).toEqual([["closes", messages.order]]);
  });
});
