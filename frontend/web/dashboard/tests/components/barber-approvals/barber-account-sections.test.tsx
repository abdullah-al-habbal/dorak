// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { BarberAccountSections } from "@/components/barber-approvals/barber-account-sections";
import { I18nContext } from "@/components/providers/i18n-context";
import { Locale } from "@/enums/access/locale.enum";
import { TextDirection } from "@/enums/access/text-direction.enum";
import { enDictionary } from "@/locales/en/index.constant";
import type { BarberApproval } from "@/types/stylists/barber-approval.type";

const hooks = vi.hoisted(() => ({ log: vi.fn(), affiliations: vi.fn() }));

vi.mock("@/hooks/stylists/invite/use-barber-activation-log", () => ({ useBarberActivationLog: hooks.log }));
vi.mock("@/hooks/stylists/invite/use-barber-affiliations", () => ({ useBarberAffiliations: hooks.affiliations }));
vi.mock("@/components/clients/client-bans-section", () => ({ ClientBansSection: () => null }));

function wrap(children: ReactNode): ReactNode {
  return <I18nContext.Provider value={{ locale: Locale.En, direction: TextDirection.Ltr, dictionary: enDictionary }}>{children}</I18nContext.Provider>;
}

describe("BarberAccountSections", () => {
  it("localizes known states and kinds, and shows Unknown for values the dictionary lacks", () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    hooks.log.mockReturnValue({ isError: false, data: [{ id: "l1", status: "enabled", activated_at: null, activated_by: null, reason: null }] });
    hooks.affiliations.mockReturnValue({
      isError: false,
      data: [
        { id: "a1", affiliable_name: { en: "Downtown" }, affiliable_type: "branch", status: "active" },
        { id: "a2", affiliable_name: { en: "Chain" }, affiliable_type: "franchise", status: "brand_new_state" },
      ],
    });

    render(wrap(<BarberAccountSections barber={{ id: "b1", bans: [] } as unknown as BarberApproval} />));

    expect(screen.getByText("Activated")).toBeInTheDocument();
    expect(screen.getByText("Branch · Active")).toBeInTheDocument();
    expect(screen.getByText(`${enDictionary.common.unknown} · ${enDictionary.common.unknown}`)).toBeInTheDocument();
    expect(screen.queryByText(/franchise|brand_new_state/)).not.toBeInTheDocument();
  });
});
