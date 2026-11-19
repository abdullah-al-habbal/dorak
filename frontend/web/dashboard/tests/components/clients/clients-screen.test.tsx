// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ClientsScreen } from "@/components/clients/clients-screen";
import { AuthActor } from "@/enums/access/auth-actor.enum";
import { OverlayKind } from "@/enums/ui/overlay-kind.enum";
import { enDictionary } from "@/locales/en/index.constant";
import { describeListScreen, listReply, renderInApp, installFetchBoundary } from "@tests/helpers/list-screen.helper";

const nav = vi.hoisted(() => ({ search: "", replace: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: nav.replace }), usePathname: () => "/dashboard/admin/clients", useSearchParams: () => new URLSearchParams(nav.search) }));

const t = enDictionary.clients;
const lina = { id: "c1", name: { en: "Lina Haddad", ar: "لينا" }, email: "lina@example.test", phone: "+962790000001", status: "enabled", is_banned: false, bookings_count: 4, created_at: "2026-01-05T10:00:00Z" };
const omar = { id: "c2", name: { en: "Omar Khoury", ar: "عمر" }, email: "omar@example.test", phone: null, status: "enabled", is_banned: true, bookings_count: 0, created_at: "2026-02-01T10:00:00Z" };

const server = installFetchBoundary(nav, { listPath: "/admin/clients" });

describeListScreen({
  screen: () => <ClientsScreen actor={AuthActor.Admin} />,
  forbidden: { screen: () => <ClientsScreen actor={AuthActor.Manager} />, title: t.states.forbiddenTitle },
  server,
  nav,
  states: { ...t.states },
  rows: { records: [lina, omar], visibleText: ["Lina Haddad", "lina@example.test", "Omar Khoury", "omar@example.test"] },
  filtered: { search: "search=zzz", clearLabel: t.filters.clear, sentToApi: "search=zzz" },
});

describe("ClientsScreen actions and filters", () => {
  it("offers Ban on an active client and Unban on a banned one, never both on a row", async () => {
    server.serve(listReply([lina, omar]));
    renderInApp(<ClientsScreen actor={AuthActor.Admin} />);
    const table = await screen.findByRole("table");
    expect(within(table).getByRole("button", { name: t.rowBan.replace("{client}", "Lina Haddad") })).toBeInTheDocument();
    expect(within(table).queryByRole("button", { name: t.rowUnban.replace("{client}", "Lina Haddad") })).not.toBeInTheDocument();
    expect(within(table).getByRole("button", { name: t.rowUnban.replace("{client}", "Omar Khoury") })).toBeInTheDocument();
    expect(within(table).queryByRole("button", { name: t.rowBan.replace("{client}", "Omar Khoury") })).not.toBeInTheDocument();
  });

  it("opens the ban dialog for the clicked client", async () => {
    server.serve(listReply([lina, omar]));
    const { overlayOpen } = renderInApp(<ClientsScreen actor={AuthActor.Admin} />);
    const table = await screen.findByRole("table");
    await userEvent.click(within(table).getByRole("button", { name: t.rowBan.replace("{client}", "Lina Haddad") }));
    expect(overlayOpen).toHaveBeenCalledWith(expect.objectContaining({ kind: OverlayKind.ClientBan, client: expect.objectContaining({ id: "c1" }) }));
  });

  it("asks for confirmation naming the client before lifting a ban", async () => {
    server.serve(listReply([lina, omar]));
    const { overlayOpen } = renderInApp(<ClientsScreen actor={AuthActor.Admin} />);
    const table = await screen.findByRole("table");
    await userEvent.click(within(table).getByRole("button", { name: t.rowUnban.replace("{client}", "Omar Khoury") }));
    expect(overlayOpen).toHaveBeenCalledWith(expect.objectContaining({ kind: OverlayKind.Confirm, title: t.unban.title, description: t.unban.body.replace("{client}", "Omar Khoury") }));
  });

  it("writes a status filter change to the URL, from page 1", async () => {
    server.serve(listReply([lina]));
    renderInApp(<ClientsScreen actor={AuthActor.Admin} />);
    await screen.findByRole("table");
    await userEvent.selectOptions(screen.getByRole("combobox", { name: t.filters.status }), "disabled");
    const href = String(nav.replace.mock.calls.at(-1)?.[0]);
    expect(href).toContain("status=disabled");
    expect(href).not.toContain("page=");
  });

  it("requests the page named in the URL and moves to the next page from the pagination bar", async () => {
    nav.search = "page=2&status=enabled&banned=banned";
    server.serve(listReply([lina], { total: 45, per_page: 20, current_page: 2, total_pages: 3 }));
    renderInApp(<ClientsScreen actor={AuthActor.Admin} />);
    await screen.findByRole("table");
    const url = server.listUrls().at(-1) ?? "";
    expect(url).toContain("page=2");
    expect(url).toContain("status=enabled");
    expect(url).toContain("banned=1");
    expect(screen.getByText(t.states.results.replace("{count}", "45"))).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: enDictionary.common.pagination.next }));
    expect(String(nav.replace.mock.calls.at(-1)?.[0])).toContain("page=3");
  });

  it("shows the error state, not a crash or a half-rendered row, when the API sends a record that breaks the contract", async () => {
    const drift = vi.spyOn(console, "error").mockImplementation(() => undefined);
    server.serve(listReply([{ id: 7, name: null }]));
    renderInApp(<ClientsScreen actor={AuthActor.Admin} />);
    expect(await screen.findByRole("alert")).toHaveTextContent(t.states.errorTitle);
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(drift).toHaveBeenCalledWith(expect.stringContaining("does not match its schema"), expect.anything());
    drift.mockRestore();
  });
});
