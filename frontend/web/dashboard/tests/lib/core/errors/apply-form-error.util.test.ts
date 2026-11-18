import { describe, expect, it, vi } from "vitest";

import { ApiErrorCode } from "@/enums/access/api-error-code.enum";
import { applyFormError, createFieldNameMapper, formFailureMessage } from "@/lib/core/errors/apply-form-error.util";
import { ApiClientError } from "@/services/api/core/api-client-error";

describe("createFieldNameMapper", () => {
  const mapper = createFieldNameMapper({ "body.en": "body_en", sort_order: "sort" });

  it("maps listed names and their nested children", () => {
    expect(mapper("sort_order")).toBe("sort");
    expect(mapper("body.en")).toBe("body_en");
    expect(mapper("body.en.heading")).toBe("body_en");
  });

  it("sends unlisted names, and look-alike prefixes, to the root", () => {
    expect(mapper("body.ar")).toBe("root");
    expect(mapper("sort_order_extra")).toBe("root");
    expect(mapper("")).toBe("root");
  });
});

describe("applyFormError", () => {
  function fakeForm() {
    return { getValues: () => ({ author_name: "", sort: "" }), setError: vi.fn() };
  }

  it("puts field errors under their field and the form message on the root", () => {
    const form = fakeForm();
    applyFormError(form, { fieldErrors: { author_name: "Taken" }, formError: "Try again" });
    expect(form.setError).toHaveBeenCalledWith("author_name", { message: "Taken" });
    expect(form.setError).toHaveBeenCalledWith("root", { message: "Try again" });
  });

  it("moves an error for a field the form does not have to the root", () => {
    const form = fakeForm();
    applyFormError(form, { fieldErrors: { slug: "Bad slug" } });
    expect(form.setError).toHaveBeenCalledOnce();
    expect(form.setError).toHaveBeenCalledWith("root", { message: "Bad slug" });
  });

  it("does nothing for an empty mapping", () => {
    const form = fakeForm();
    applyFormError(form, { fieldErrors: {} });
    expect(form.setError).not.toHaveBeenCalled();
  });
});

describe("formFailureMessage", () => {
  const messages = { invalid: "Check the details.", failed: "Try again." };

  it("uses the invalid message only for a 422", () => {
    expect(formFailureMessage(new ApiClientError({ status: 422, code: ApiErrorCode.InvalidRequest, message: "" }), messages)).toBe(messages.invalid);
    expect(formFailureMessage(new ApiClientError({ status: 500, code: ApiErrorCode.Server, message: "" }), messages)).toBe(messages.failed);
    expect(formFailureMessage(new Error("boom"), messages)).toBe(messages.failed);
  });
});
