import {
  decrementUnread,
  mapNotificationInbox,
  mapNotificationReadAll,
} from "@/services/api/notification-inbox-mapper.util";
import { describe, expect, it } from "vitest";

const item = (id: string, readAt: string | null) => ({
  id,
  type: "booking_update",
  title: "T",
  body: "B",
  data: {},
  readAt,
  createdAt: "2026-10-22T10:00:00Z",
});

describe("notification inbox mappers", () => {
  it("maps snake_case rows and meta into the BFF inbox", () => {
    const inbox = mapNotificationInbox(
      [
        {
          id: "1",
          type: "booking_update",
          title: "T",
          body: "B",
          data: null,
          read_at: null,
          created_at: "2026-10-22T10:00:00Z",
        },
      ],
      { pagination: { total: 4 }, unread_count: 2 },
    );
    expect(inbox).toEqual({
      items: [item("1", null)],
      unreadCount: 2,
      total: 4,
    });
  });

  it("falls back to counting unread rows when meta is missing", () => {
    expect(mapNotificationInbox("bad", undefined)).toEqual({
      items: [],
      unreadCount: 0,
      total: 0,
    });
  });

  it("maps read-all results", () => {
    expect(mapNotificationReadAll({ updated: 3, unread_count: 0 })).toEqual({
      updated: 3,
      unreadCount: 0,
    });
  });

  it("decrements the unread count once per notification", () => {
    const inbox = {
      items: [item("1", null), item("2", "2026-10-21T00:00:00Z")],
      unreadCount: 1,
      total: 2,
    };
    const next = decrementUnread(inbox, "1", "2026-10-22T11:00:00Z");
    expect(next.unreadCount).toBe(0);
    expect(next.items[0].readAt).toBe("2026-10-22T11:00:00Z");
    expect(decrementUnread(next, "1", "x")).toBe(next);
    expect(decrementUnread(inbox, "2", "x")).toBe(inbox);
  });
});
