import { z } from "zod";

import { Weekday } from "@/enums/booking/weekday.enum";
import { specialDayIssue } from "@/lib/hours/hours-override.util";
import type { SpecialDayIssue } from "@/lib/hours/hours-override.util";

type SpecialDayFormMessages = Record<SpecialDayIssue, string>;

/** The field each rule of `specialDayIssue` is shown under. */
const ISSUE_FIELD: Record<SpecialDayIssue, string> = {
  date: "date",
  past: "date",
  range: "endDate",
  repeatNeedsEnd: "endDate",
  times: "opens",
  order: "closes",
};

/** The draft is checked by `specialDayIssue`, so the form and the util never disagree. */
export function createSpecialDayFormSchema(messages: SpecialDayFormMessages, today?: string) {
  return z
    .object({
      date: z.string(),
      kind: z.enum(["closed", "hours"]),
      opens: z.string(),
      closes: z.string(),
      endDate: z.string(),
      weekdays: z.array(z.enum(Weekday)),
    })
    .superRefine((draft, context) => {
      const issue = specialDayIssue(draft, today);
      if (issue !== undefined) context.addIssue({ code: "custom", path: [ISSUE_FIELD[issue]], message: messages[issue] });
    });
}
