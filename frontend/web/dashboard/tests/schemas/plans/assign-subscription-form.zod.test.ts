import { describe, expect, it } from "vitest";

import { enDictionary } from "@/locales/en/index.constant";
import { createAssignSubscriptionFormSchema } from "@/schemas/plans/assign-subscription-form.zod";

const messages = enDictionary.adminSubscriptions.assignDialog.validation;
const schema = createAssignSubscriptionFormSchema(messages);

describe("assign subscription form schema", () => {
  it("accepts a chosen brand and plan", () => {
    expect(schema.parse({ brand_id: "b1", plan_id: "p1" })).toEqual({ brand_id: "b1", plan_id: "p1" });
  });

  it("names the missing choice", () => {
    const result = schema.safeParse({ brand_id: "", plan_id: "" });
    expect(result.error?.issues.map((issue) => [issue.path[0], issue.message])).toEqual([
      ["brand_id", messages.brand],
      ["plan_id", messages.plan],
    ]);
  });
});
