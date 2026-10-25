// @vitest-environment jsdom
import { NotificationBell } from "@/components/portal/notification-bell";
import { en } from "@/i18n/messages/en.constant";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/services/api/common/notification-inbox/notification-inbox.mutation";
import { getNotificationInbox } from "@/services/api/common/notification-inbox/notification-inbox.query";
import type { INotificationInbox } from "@/services/api/common/notification-inbox/types/notification-inbox.types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const session = vi.hoisted(() => ({ actor: "manager" }));
const router = vi.hoisted(() => ({ push: vi.fn() }));

// jsdom ships no CSS.escape; react-aria menus use it to find item elements.
vi.stubGlobal("CSS", {
  escape: (value: string) => value.replace(/["\\]/g, "\\$&"),
});

vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("@/hooks/use-session", () => ({ useSession: () => session }));
vi.mock("@/hooks/use-dictionary", async () => {
  const { en: dictionary } = await vi.importActual<
    typeof import("@/i18n/messages/en.constant")
  >("@/i18n/messages/en.constant");
  return { useDictionary: () => dictionary };
});
vi.mock(
  "@/services/api/common/notification-inbox/notification-inbox.query",
  () => ({
    getNotificationInbox: vi.fn(),
  }),
);
vi.mock(
  "@/services/api/common/notification-inbox/notification-inbox.mutation",
  () => ({
    markNotificationRead: vi.fn(),
    markAllNotificationsRead: vi.fn(),
  }),
);

const notification = (
  id: string,
  title: string,
  readAt: string | null,
  type = "booking_update",
  data: Record<string, unknown> = {},
) => ({
  id,
  type,
  title,
  body: `${title} body`,
  data,
  readAt,
  createdAt: "2026-10-22T10:00:00Z",
});

function inbox(firstReadAt: string | null, unreadCount: number) {
  return {
    items: [
      notification("n-1", "First update", firstReadAt),
      notification("n-2", "Second update", null),
    ],
    unreadCount,
    total: 2,
  } satisfies INotificationInbox;
}

function renderBell() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <NotificationBell />
    </QueryClientProvider>,
  );
}

const unreadLabel = (count: number) =>
  en.common.notifications.unreadLabel.replace("{count}", String(count));

beforeEach(() => {
  session.actor = "manager";
  router.push.mockReset();
  vi.mocked(getNotificationInbox).mockReset();
  vi.mocked(markNotificationRead).mockReset();
  vi.mocked(markAllNotificationsRead).mockReset();
});

afterEach(cleanup);

describe("NotificationBell", () => {
  it("decrements the unread count after marking a notification read", async () => {
    vi.mocked(getNotificationInbox)
      .mockResolvedValueOnce(inbox(null, 2))
      .mockResolvedValue(inbox("2026-10-22T11:00:00Z", 1));
    vi.mocked(markNotificationRead).mockResolvedValue(
      notification("n-1", "First update", "2026-10-22T11:00:00Z"),
    );
    const user = userEvent.setup();
    renderBell();

    const trigger = await screen.findByRole("button", {
      name: unreadLabel(2),
    });
    expect(screen.getByTestId("notification-unread-count").textContent).toBe(
      "2",
    );

    await user.click(trigger);
    await user.click(
      await screen.findByRole("menuitem", { name: /First update/ }),
    );

    await waitFor(() =>
      expect(screen.getByTestId("notification-unread-count").textContent).toBe(
        "1",
      ),
    );
    expect(markNotificationRead).toHaveBeenCalledWith("n-1", expect.anything());
    expect(screen.getByRole("button", { name: unreadLabel(1) })).toBeTruthy();
  });

  it("hides the unread badge after mark all as read", async () => {
    vi.mocked(getNotificationInbox)
      .mockResolvedValueOnce(inbox(null, 2))
      .mockResolvedValue(inbox("2026-10-22T11:00:00Z", 0));
    vi.mocked(markAllNotificationsRead).mockResolvedValue({
      updated: 2,
      unreadCount: 0,
    });
    const user = userEvent.setup();
    renderBell();

    await user.click(
      await screen.findByRole("button", { name: unreadLabel(2) }),
    );
    await user.click(
      await screen.findByRole("menuitem", {
        name: en.common.notifications.markAllRead,
      }),
    );

    await waitFor(() =>
      expect(screen.queryByTestId("notification-unread-count")).toBeNull(),
    );
  });

  it("renders nothing and fetches nothing for admins", () => {
    session.actor = "admin";
    const { container } = renderBell();

    expect(container.innerHTML).toBe("");
    expect(getNotificationInbox).not.toHaveBeenCalled();
  });

  it("opens the booking for a booking update", async () => {
    vi.mocked(getNotificationInbox).mockResolvedValue({
      items: [
        notification(
          "n-1",
          "Booking moved",
          "2026-10-22T11:00:00Z",
          "booking_update",
          {
            booking_id: "b-9",
          },
        ),
      ],
      unreadCount: 0,
      total: 1,
    });
    const user = userEvent.setup();
    renderBell();

    await user.click(await screen.findByRole("button"));
    await user.click(
      await screen.findByRole("menuitem", { name: /Booking moved/ }),
    );

    expect(router.push).toHaveBeenCalledWith("/manager/bookings/b-9");
  });

  it.each(["invite", "application", "review_request"])(
    "renders %s notifications and marks them read without navigating",
    async (type) => {
      vi.mocked(getNotificationInbox)
        .mockResolvedValueOnce({
          items: [
            notification("n-1", "Heads up", null, type, { booking_id: "b-9" }),
          ],
          unreadCount: 1,
          total: 1,
        })
        .mockResolvedValue({ items: [], unreadCount: 0, total: 0 });
      vi.mocked(markNotificationRead).mockResolvedValue(
        notification("n-1", "Heads up", "2026-10-22T11:00:00Z", type),
      );
      const user = userEvent.setup();
      renderBell();

      await user.click(
        await screen.findByRole("button", { name: unreadLabel(1) }),
      );
      await user.click(
        await screen.findByRole("menuitem", { name: /Heads up/ }),
      );

      expect(markNotificationRead).toHaveBeenCalledWith(
        "n-1",
        expect.anything(),
      );
      expect(router.push).not.toHaveBeenCalled();
    },
  );
});
