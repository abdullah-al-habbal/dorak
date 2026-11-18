import { describe, expect, it } from "vitest";

import { formToInviteRequest, mapInviteFieldName } from "@/lib/branches/invite-barber-form.util";

describe("invite barber mapping", () => {
  it("invites a chosen barber by id and leaves a blank commission out", () => {
    expect(formToInviteRequest({ term: "sam", barber_id: "b1", commission: " " })).toEqual({ kind: "barber", payload: { barber_id: "b1" } });
  });

  it("invites by trimmed contact when no barber is chosen, with the commission as a number", () => {
    expect(formToInviteRequest({ term: " sam@example.com ", barber_id: "", commission: "12.5" })).toEqual({ kind: "contact", payload: { contact: "sam@example.com", commission_percent: 12.5 } });
  });

  it("sends a zero commission", () => {
    expect(formToInviteRequest({ term: "", barber_id: "b1", commission: "0" })).toEqual({ kind: "barber", payload: { barber_id: "b1", commission_percent: 0 } });
  });

  it("maps backend field names onto form fields", () => {
    expect(mapInviteFieldName("contact")).toBe("barber_id");
    expect(mapInviteFieldName("commission_percent")).toBe("commission");
    expect(mapInviteFieldName("other")).toBe("root");
  });
});
