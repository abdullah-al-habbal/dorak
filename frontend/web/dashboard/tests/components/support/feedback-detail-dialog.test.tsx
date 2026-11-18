// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FeedbackDetailDialog } from "@/components/support/feedback-detail-dialog";
import { I18nContext } from "@/components/providers/i18n-context";
import { Locale } from "@/enums/access/locale.enum";
import { TextDirection } from "@/enums/access/text-direction.enum";
import { enDictionary } from "@/locales/en/index.constant";
import type { FeedbackReport } from "@/types/support/feedback-report.type";

const mutate = vi.hoisted(() => ({ mutateAsync: vi.fn(), isPending: false }));
vi.mock("@/hooks/support/use-update-feedback-report", () => ({ useUpdateFeedbackReport: () => mutate }));

const t = enDictionary.support;
const report = {
  id: "r1",
  kind: "bug",
  status: "new",
  message: "<img src=x onerror=alert(1)> button broken",
  contact_email: null,
  source: { app: "client", platform: "ios", app_version: "1.4.2+17", locale: "ar", screen: "booking/confirm", workflow: "create_booking", user_type: "client", user_id: "u1" },
  related: { type: "booking", id: "b-9" },
  admin_note: null,
  created_at: "2026-11-18T10:00:00Z",
  updated_at: null,
} as FeedbackReport;

function open(onClose = vi.fn()) {
  render(
    <I18nContext.Provider value={{ locale: Locale.En, direction: TextDirection.Ltr, dictionary: enDictionary }}>
      <FeedbackDetailDialog report={report} onClose={onClose} />
    </I18nContext.Provider>,
  );
  return onClose;
}

describe("FeedbackDetailDialog", () => {
  beforeEach(() => {
    mutate.mutateAsync.mockReset();
  });

  it("shows the sender's text as plain text and keeps the source apart from the related record", () => {
    open();
    expect(screen.getByText(report.message)).toBeInTheDocument();
    expect(document.querySelector("img")).toBeNull();
    expect(screen.getByText("booking/confirm")).toBeInTheDocument();
    expect(screen.getByText("1.4.2+17")).toBeInTheDocument();
    expect(screen.getByText("b-9")).toBeInTheDocument();
  });

  it("saves the chosen status and a trimmed note, then closes", async () => {
    mutate.mutateAsync.mockResolvedValue(report);
    const onClose = open();
    await userEvent.selectOptions(screen.getByLabelText(t.dialog.status), "triaged");
    await userEvent.type(screen.getByRole("textbox", { name: new RegExp(t.dialog.note) }), "  Looks real ");
    await userEvent.click(screen.getByRole("button", { name: t.dialog.save }));
    expect(mutate.mutateAsync).toHaveBeenCalledWith({ id: "r1", status: "triaged", admin_note: "Looks real" });
    expect(onClose).toHaveBeenCalled();
  });

  it("keeps the dialog open and shows the failure when saving fails", async () => {
    mutate.mutateAsync.mockRejectedValue(new Error("boom"));
    const onClose = open();
    await userEvent.click(screen.getByRole("button", { name: t.dialog.save }));
    expect(await screen.findByText(t.dialog.failed)).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });
});
