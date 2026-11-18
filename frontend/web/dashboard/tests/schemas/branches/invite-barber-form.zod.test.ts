import { describe, expect, it } from "vitest";

import { enDictionary } from "@/locales/en/index.constant";
import { createInviteBarberFormSchema } from "@/schemas/branches/invite-barber-form.zod";

const messages = enDictionary.invitations.inviteDialog;
const schema = createInviteBarberFormSchema(messages);

function issues(values: { term: string; barber_id: string; commission: string }): Array<[PropertyKey, string]> {
  return (schema.safeParse(values).error?.issues ?? []).map((issue) => [issue.path[0], issue.message]);
}

describe("invite barber form schema", () => {
  it("accepts a chosen barber with no commission", () => {
    expect(schema.safeParse({ term: "sam", barber_id: "b1", commission: "" }).success).toBe(true);
  });

  it("accepts an exact email or phone without a chosen barber", () => {
    expect(schema.safeParse({ term: " sam@example.com ", barber_id: "", commission: "10" }).success).toBe(true);
    expect(schema.safeParse({ term: "+966 500 000 000", barber_id: "", commission: "" }).success).toBe(true);
  });

  it("asks to choose a barber when the search is neither a pick nor a contact", () => {
    expect(issues({ term: "sam", barber_id: "", commission: "" })).toEqual([["barber_id", messages.pick]]);
  });

  it("keeps the commission between 0 and 100", () => {
    expect(schema.safeParse({ term: "", barber_id: "b1", commission: "0" }).success).toBe(true);
    expect(schema.safeParse({ term: "", barber_id: "b1", commission: "100" }).success).toBe(true);
    expect(issues({ term: "", barber_id: "b1", commission: "101" })).toEqual([["commission", messages.commissionRange]]);
    expect(issues({ term: "", barber_id: "b1", commission: "-1" })).toEqual([["commission", messages.commissionRange]]);
    expect(issues({ term: "", barber_id: "b1", commission: "abc" })).toEqual([["commission", messages.commissionRange]]);
  });
});
