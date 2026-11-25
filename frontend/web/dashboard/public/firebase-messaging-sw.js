/* Dorak dashboard: shows FCM web push messages. No Firebase code and no secrets live here.
 * FCM delivers `{ notification: { title, body, lang, dir }, data: {...} }` as the push payload. */
self.addEventListener("push", (event) => {
  const payload = readPayload(event);
  const notification = payload.notification || {};
  if (!notification.title) return;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      // A dashboard tab the person is looking at already refreshes its own bell; do not pop a second alert.
      if (clients.some((client) => client.visibilityState === "visible" && client.focused)) return undefined;
      return self.registration.showNotification(notification.title, {
        body: notification.body || "",
        lang: notification.lang || undefined,
        dir: notification.dir || "auto",
        data: payload.data || {},
      });
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const open = clients.find((client) => client.url.includes("/dashboard/"));
      if (open) return open.focus();
      return self.clients.openWindow("/dashboard");
    }),
  );
});

function readPayload(event) {
  try {
    return event.data ? event.data.json() : {};
  } catch {
    return {};
  }
}
