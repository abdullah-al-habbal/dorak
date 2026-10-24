const BASE = "/notifications";

export const NotificationInboxEndpoints = {
  inbox: BASE,
  markRead: (id: string) => `${BASE}/${encodeURIComponent(id)}/read`,
  markAllRead: `${BASE}/read-all`,
} as const;
