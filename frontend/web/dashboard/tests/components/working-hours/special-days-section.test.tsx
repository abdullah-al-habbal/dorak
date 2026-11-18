// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { I18nContext } from "@/components/providers/i18n-context";
import { SpecialDaysSection } from "@/components/working-hours/special-days-section";
import { Locale } from "@/enums/access/locale.enum";
import { TextDirection } from "@/enums/access/text-direction.enum";
import { enDictionary } from "@/locales/en/index.constant";

const save = vi.fn();
const saveRange = vi.fn();

vi.mock("@/hooks/hours/use-hours-overrides", () => ({ useHoursOverrides: () => ({ data: [], isError: false }) }));
vi.mock("@/hooks/hours/use-set-hours-override", () => ({ useSetHoursOverride: () => ({ mutateAsync: save, isPending: false }) }));
vi.mock("@/hooks/hours/use-set-hours-override-range", () => ({ useSetHoursOverrideRange: () => ({ mutateAsync: saveRange, isPending: false }) }));
vi.mock("@/hooks/hours/use-clear-hours-override", () => ({ useClearHoursOverride: () => ({ mutate: vi.fn(), isPending: false }) }));

const t = enDictionary.workingHours.specialDays;
const FUTURE = "2999-01-10";

function renderSection() {
  render(
    <I18nContext.Provider value={{ locale: Locale.En, direction: TextDirection.Ltr, dictionary: enDictionary }}>
      <SpecialDaysSection branchId="br1" />
    </I18nContext.Provider>,
  );
}

describe("SpecialDaysSection", () => {
  beforeEach(() => {
    save.mockReset();
    saveRange.mockReset();
  });

  it("asks for a date and sends nothing", async () => {
    renderSection();
    await userEvent.click(screen.getByRole("button", { name: t.add }));
    expect(await screen.findByText(t.issues.date)).toBeInTheDocument();
    expect(save).not.toHaveBeenCalled();
  });

  it("saves a closed single day through the single-day endpoint", async () => {
    renderSection();
    await userEvent.type(screen.getByLabelText(t.date), FUTURE);
    await userEvent.click(screen.getByRole("button", { name: t.add }));
    await waitFor(() => expect(save).toHaveBeenCalledWith({ branchId: "br1", date: FUTURE, input: { is_closed: true } }));
    expect(saveRange).not.toHaveBeenCalled();
  });

  it("saves a range through the range endpoint", async () => {
    renderSection();
    await userEvent.type(screen.getByLabelText(t.date), FUTURE);
    await userEvent.type(screen.getByLabelText(new RegExp(`^${t.endDate}`)), "2999-01-12");
    await userEvent.click(screen.getByRole("button", { name: t.add }));
    await waitFor(() => expect(saveRange).toHaveBeenCalledWith({ branchId: "br1", input: { date_from: FUTURE, date_to: "2999-01-12", is_closed: true } }));
  });

  it("shows the missing-times issue under the hours fields", async () => {
    renderSection();
    await userEvent.type(screen.getByLabelText(t.date), FUTURE);
    await userEvent.selectOptions(screen.getByLabelText(t.kind), "hours");
    await userEvent.click(screen.getByRole("button", { name: t.add }));
    expect(await screen.findByText(t.issues.times)).toBeInTheDocument();
    expect(save).not.toHaveBeenCalled();
  });
});
