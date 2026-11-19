// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AdminUsersScreen } from "@/components/admin-users/admin-users-screen";
import { AuthActor } from "@/enums/access/auth-actor.enum";
import { OverlayKind } from "@/enums/ui/overlay-kind.enum";
import { enDictionary } from "@/locales/en/index.constant";
import { dataReply, describeListScreen, listReply, renderInApp, installFetchBoundary } from "@tests/helpers/list-screen.helper";

const nav = vi.hoisted(() => ({ search: "", replace: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: nav.replace }), usePathname: () => "/dashboard/admin/admins", useSearchParams: () => new URLSearchParams(nav.search) }));

const t = enDictionary.adminUsers;
const me = { id: "a1", name: { en: "Maya Nasser", ar: "مايا" }, email: "maya@dorak.test", is_active: true, created_at: "2026-01-02T10:00:00Z" };
const colleague = { id: "a2", name: { en: "Omar Saleh", ar: "عمر" }, email: "omar@dorak.test", is_active: true, created_at: "2026-01-03T10:00:00Z" };
const dormant = { id: "a3", name: { en: "Rana Aziz", ar: "رنا" }, email: "rana@dorak.test", is_active: false, created_at: "2026-01-04T10:00:00Z" };

const server = installFetchBoundary(nav, {
  listPath: "/admin/admins",
  side: { "/profile": dataReply({ display_name: "Maya Nasser", email: "maya@dorak.test", phone: null, pending_email: null }) },
});

describeListScreen({
  screen: () => <AdminUsersScreen actor={AuthActor.Admin} />,
  forbidden: { screen: () => <AdminUsersScreen actor={AuthActor.Manager} />, title: t.states.forbiddenTitle },
  server,
  nav,
  states: { ...t.states },
  rows: { records: [me, colleague], visibleText: ["Omar Saleh", "omar@dorak.test", "maya@dorak.test"] },
  filtered: { search: "search=zzz", clearLabel: t.filters.clear, sentToApi: "search=zzz" },
});

describe("AdminUsersScreen row rules", () => {
  async function showRows() {
    server.serve(listReply([me, colleague, dormant]));
    const app = renderInApp(<AdminUsersScreen actor={AuthActor.Admin} />);
    const table = await screen.findByRole("table");
    await waitFor(() => expect(within(table).getByText(t.you)).toBeInTheDocument());
    return { ...app, table };
  }

  it("marks the signed-in admin and hides their own deactivate button, but keeps it for everyone else", async () => {
    const { table } = await showRows();
    expect(within(table).queryByRole("button", { name: t.rowDeactivate.replace("{admin}", "Maya Nasser") })).not.toBeInTheDocument();
    expect(within(table).getByRole("button", { name: t.rowDeactivate.replace("{admin}", "Omar Saleh") })).toBeInTheDocument();
  });

  it("offers reactivate, and no resend-invite, on a deactivated admin", async () => {
    const { table } = await showRows();
    expect(within(table).getByRole("button", { name: t.rowReactivate.replace("{admin}", "Rana Aziz") })).toBeInTheDocument();
    expect(within(table).queryByRole("button", { name: t.rowResend.replace("{admin}", "Rana Aziz") })).not.toBeInTheDocument();
    expect(within(table).getByRole("button", { name: t.rowResend.replace("{admin}", "Omar Saleh") })).toBeInTheDocument();
  });

  it("asks for a destructive confirmation naming the admin before deactivating", async () => {
    const { table, overlayOpen } = await showRows();
    await userEvent.click(within(table).getByRole("button", { name: t.rowDeactivate.replace("{admin}", "Omar Saleh") }));
    expect(overlayOpen).toHaveBeenCalledWith(expect.objectContaining({
      kind: OverlayKind.Confirm,
      title: t.confirm.deactivate.title,
      description: t.confirm.deactivate.body.replace("{admin}", "Omar Saleh"),
      destructive: true,
    }));
  });

  it("opens the invite form from the header and the edit form for a row", async () => {
    const { table, overlayOpen } = await showRows();
    await userEvent.click(screen.getByRole("button", { name: t.invite }));
    expect(overlayOpen).toHaveBeenLastCalledWith({ kind: OverlayKind.AdminUserForm });
    await userEvent.click(within(table).getByRole("button", { name: t.rowEdit.replace("{admin}", "Omar Saleh") }));
    expect(overlayOpen).toHaveBeenLastCalledWith(expect.objectContaining({ kind: OverlayKind.AdminUserForm, admin: expect.objectContaining({ id: "a2" }) }));
  });

  it("maps the status filter to the backend's active flag and writes it to the URL", async () => {
    await showRows();
    await userEvent.selectOptions(screen.getByRole("combobox", { name: t.filters.state }), "inactive");
    expect(String(nav.replace.mock.calls.at(-1)?.[0])).toContain("state=inactive");
  });
});
