// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AuthStoreProvider } from "@/components/providers/auth-store-provider";
import { I18nProvider } from "@/components/providers/i18n-provider";
import { OverviewPanel } from "@/components/overview/overview-panel";
import { AuthActor } from "@/enums/access/auth-actor.enum";
import { BackendActorType } from "@/enums/access/backend-actor-type.enum";
import { BackendRole } from "@/enums/access/backend-role.enum";
import { Locale } from "@/enums/access/locale.enum";
import { DICTIONARIES } from "@/locales/dictionaries.constant";
import { LOCALE_DIRECTION } from "@/config/locales.constant";

const adminProfile = {
  id: "1",
  actor_type: BackendActorType.Admin,
  role: BackendRole.PlatformAdmin,
  branch_id: null,
  display_name: "Admin",
  email: "admin@example.test",
  permissions: ["dashboard"],
};

function renderPanel(locale: Locale, profile: typeof adminProfile | (Omit<typeof adminProfile, "branch_id" | "actor_type" | "role"> & { branch_id: string; actor_type: BackendActorType; role: BackendRole })) {
  return render(
    <I18nProvider value={{ locale, direction: LOCALE_DIRECTION[locale], dictionary: DICTIONARIES[locale] }}>
      <AuthStoreProvider actor={AuthActor.Admin} profile={profile}>
        <OverviewPanel />
      </AuthStoreProvider>
    </I18nProvider>,
  );
}

describe("OverviewPanel", () => {
  it("shows the localized role, never the machine key or the token abilities", () => {
    renderPanel(Locale.En, adminProfile);
    expect(screen.getByText("Platform admin")).toBeInTheDocument();
    expect(screen.queryByText("platform_admin")).not.toBeInTheDocument();
    expect(screen.queryByText("dashboard")).not.toBeInTheDocument();
  });

  it("shows the role in Arabic", () => {
    renderPanel(Locale.Ar, adminProfile);
    expect(screen.getByText(DICTIONARIES[Locale.Ar].shell.overview.roles.platform_admin)).toBeInTheDocument();
  });

  it("omits the branch row for an account without a branch", () => {
    renderPanel(Locale.En, adminProfile);
    expect(screen.queryByText(DICTIONARIES[Locale.En].shell.overview.scope)).not.toBeInTheDocument();
  });

  it("shows the branch name, not its id, for a branch account", () => {
    renderPanel(Locale.En, { ...adminProfile, actor_type: BackendActorType.Branch, role: BackendRole.BranchManager, branch_id: "42", display_name: "Downtown" });
    expect(screen.getByText(DICTIONARIES[Locale.En].shell.overview.scope)).toBeInTheDocument();
    expect(screen.getAllByText("Downtown").length).toBeGreaterThan(0);
    expect(screen.queryByText("42")).not.toBeInTheDocument();
  });

  it("shows the Unknown label for a role the dictionary lacks", () => {
    // @ts-expect-error a role newer than this dashboard build
    renderPanel(Locale.En, { ...adminProfile, role: "auditor" });
    expect(screen.getByText("Unknown")).toBeInTheDocument();
    expect(screen.queryByText("auditor")).not.toBeInTheDocument();
  });
});
