// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { I18nContext } from "@/components/providers/i18n-context";
import { TestimonialDialog } from "@/components/website-content/testimonial-dialog";
import { ApiErrorCode } from "@/enums/access/api-error-code.enum";
import { Locale } from "@/enums/access/locale.enum";
import { TextDirection } from "@/enums/access/text-direction.enum";
import { enDictionary } from "@/locales/en/index.constant";
import { ApiClientError } from "@/services/api/core/api-client-error";

const mutateAsync = vi.fn();

vi.mock("@/hooks/platform/settings/use-website-content", () => ({
  useSaveTestimonial: () => ({ mutateAsync, isPending: false }),
}));

const f = enDictionary.content.testimonialForm;
const sections = [{ id: "s1", label: "/home · Loved" }];

function renderDialog(onClose = vi.fn()) {
  render(
    <I18nContext.Provider value={{ locale: Locale.En, direction: TextDirection.Ltr, dictionary: enDictionary }}>
      <TestimonialDialog sections={sections} onClose={onClose} />
    </I18nContext.Provider>,
  );
  return onClose;
}

async function fillRequired(): Promise<void> {
  await userEvent.type(screen.getByLabelText(f.author), " Sam ");
  await userEvent.type(screen.getByLabelText(f.bodyEn), "Great");
  await userEvent.type(screen.getByLabelText(f.bodyAr), "ممتاز");
}

describe("TestimonialDialog", () => {
  beforeEach(() => {
    mutateAsync.mockReset();
  });

  it("shows an error under each missing field and does not call the API", async () => {
    renderDialog();
    await userEvent.click(screen.getByRole("button", { name: f.create }));
    expect((await screen.findAllByText(f.required)).length).toBe(3);
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("offers the labelled section, never an id, and sends the payload the API expects", async () => {
    const onClose = renderDialog();
    expect(screen.getByRole("option", { name: "/home · Loved" })).toBeInTheDocument();
    await fillRequired();
    await userEvent.click(screen.getByRole("button", { name: f.create }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(mutateAsync).toHaveBeenCalledTimes(1);
    expect(mutateAsync).toHaveBeenCalledWith({
      id: undefined,
      payload: {
        section_id: "s1",
        author_name: "Sam",
        author_title: { en: "", ar: "" },
        body: { en: "Great", ar: "ممتاز" },
        avatar_url: null,
        rating: 5,
        sort_order: 0,
      },
    });
  });

  it("puts a backend field error under its field and keeps the dialog open", async () => {
    mutateAsync.mockRejectedValue(new ApiClientError({ status: 422, code: ApiErrorCode.InvalidRequest, message: "", fields: { author_name: ["Already has one."] } }));
    const onClose = renderDialog();
    await fillRequired();
    await userEvent.click(screen.getByRole("button", { name: f.create }));
    expect(await screen.findByText("Already has one.")).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("shows the generic message when the failure names no field", async () => {
    mutateAsync.mockRejectedValue(new ApiClientError({ status: 500, code: ApiErrorCode.Server, message: "" }));
    renderDialog();
    await fillRequired();
    await userEvent.click(screen.getByRole("button", { name: f.create }));
    expect(await screen.findByText(f.failed)).toBeInTheDocument();
  });
});
