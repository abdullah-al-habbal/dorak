import { describe, expect, it } from "vitest";

import { emailCodeFormSchema } from "@/schemas/email-code-form.zod";

describe("emailCodeFormSchema", () => {
  const schema = emailCodeFormSchema("code");

  it("accepts exactly six digits, trimmed", () => {
    expect(schema.safeParse({ code: " 123456 " }).data).toEqual({ code: "123456" });
  });

  it.each(["12345", "1234567", "12a456", ""])("rejects %j", (code) => {
    expect(schema.safeParse({ code }).success).toBe(false);
  });
});
