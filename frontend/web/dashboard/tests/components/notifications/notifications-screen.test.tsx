// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { NotificationsScreen } from "@/components/notifications/notifications-screen";
import { AuthActor } from "@/enums/access/auth-actor.enum";
import { enDictionary } from "@/locales/en/index.constant";
import { pageOf, renderInApp } from "@tests/helpers/list-screen.helper";

const state = vi.hoisted(() => ({ query: {} as Record<string, unknown>, search: "", refetch: vi.fn(), markAll: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }), usePathname: () => "/dashboard/manager/notifications", useSearchParams: () => new URLSearchParams(state.search) }));
vi.mock("@/hooks/account/notifications/use-notification-page", () => ({ useNotificationPage: () => state.query }));
vi.mock("@/hooks/account/notifications/use-mark-notification-read", () => ({
  useMarkNotificationRead: () => ({ mutate: vi.fn() }),
  useMarkAllNotificationsRead: () => ({ mutate: state.markAll, isPending: false }),
}));
vi.mock("@/components/layout/notifications/notification-item", () => ({ NotificationItem: () => <div data-testid="rows" /> }));

const t = enDictionary.notificationsPage;
const shell = enDictionary.shell.notifications;

function show(fields: Record<string, unknown>, search = ""): void {
  state.search = search;
  state.query = { isPending: false, isError: false, isFetching: false, data: undefined, refetch: state.refetch, ...fields };
  renderInApp(<NotificationsScreen actor={AuthActor.Manager} />);
}

describe("NotificationsScreen states", () => {
  beforeEach(() => {
    state.refetch.mockReset();
    state.markAll.mockReset();
  });

  it("shows a loading skeleton while the first page loads", () => {
    show({ isPending: true });
    expect(screen.getByRole("status", { name: enDictionary.common.loading })).toBeInTheDocument();
  });

  it("shows an error with a working retry", async () => {
    show({ isError: true });
    expect(screen.getByRole("alert")).toHaveTextContent(t.errorTitle);
    await userEvent.click(screen.getByRole("button", { name: enDictionary.common.retry }));
    expect(state.refetch).toHaveBeenCalledTimes(1);
  });

  it("shows the empty state when there is nothing and no filter", () => {
    show({ data: { ...pageOf([]), unreadCount: 0 } });
    expect(screen.getByText(shell.empty)).toBeInTheDocument();
  });

  it("shows the filtered state when only unread are wanted and none exist", () => {
    show({ data: { ...pageOf([]), unreadCount: 0 } }, "unread=1");
    expect(screen.getByText(t.filteredTitle)).toBeInTheDocument();
    expect(screen.queryByText(shell.empty)).not.toBeInTheDocument();
  });

  it("shows the rows and the count, and lets the user mark everything read", async () => {
    show({ data: { ...pageOf([{ id: "1", data: {} }, { id: "2", data: {} }]), unreadCount: 2 } });
    expect(screen.getAllByTestId("rows")).toHaveLength(2);
    expect(screen.getByText(t.results.replace("{count}", "2"))).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: shell.markAll }));
    expect(state.markAll).toHaveBeenCalledTimes(1);
  });

  it("disables mark-all when nothing is unread", () => {
    show({ data: { ...pageOf([{ id: "1", data: {} }]), unreadCount: 0 } });
    expect(screen.getByRole("button", { name: shell.markAll })).toBeDisabled();
  });
});
