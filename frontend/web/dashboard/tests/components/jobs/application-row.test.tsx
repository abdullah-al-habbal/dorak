// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ApplicationRow } from "@/components/jobs/application-row";
import { I18nContext } from "@/components/providers/i18n-context";
import { Locale } from "@/enums/access/locale.enum";
import { TextDirection } from "@/enums/access/text-direction.enum";
import { ApplicationStatus } from "@/enums/booking/application-status.enum";
import { enDictionary } from "@/locales/en/index.constant";
import type { JobApplication } from "@/types/jobs/job-application.type";

function application(status: ApplicationStatus): JobApplication {
  return { id: "a1", barber_id: "b1", status, created_at: "2026-11-01T10:00:00Z", profile_snapshot: { name: { en: "Sam" } } } as unknown as JobApplication;
}

function renderRow(status: ApplicationStatus, onStatus = vi.fn()) {
  render(
    <I18nContext.Provider value={{ locale: Locale.En, direction: TextDirection.Ltr, dictionary: enDictionary }}>
      <ul>
        <ApplicationRow application={application(status)} busy={false} onStatus={onStatus} onInvite={vi.fn()} />
      </ul>
    </I18nContext.Provider>,
  );
  return onStatus;
}

describe("ApplicationRow seen control", () => {
  it("offers to mark a new application as seen and sends the seen status", async () => {
    const onStatus = renderRow(ApplicationStatus.Submitted);
    await userEvent.click(screen.getByRole("button", { name: "Mark as seen" }));
    expect(onStatus).toHaveBeenCalledWith(expect.objectContaining({ id: "a1" }), ApplicationStatus.Seen);
  });

  it.each([ApplicationStatus.Seen, ApplicationStatus.Accepted, ApplicationStatus.Rejected])("does not offer it once the application is %s", (status) => {
    renderRow(status);
    expect(screen.queryByRole("button", { name: "Mark as seen" })).not.toBeInTheDocument();
  });
});
