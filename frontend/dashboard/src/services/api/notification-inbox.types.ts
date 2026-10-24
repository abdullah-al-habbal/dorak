import { z } from "zod";
import {
  NotificationItemSchema,
  NotificationInboxSchema,
  NotificationReadAllSchema,
  BackendNotificationSchema,
} from "@/services/api/notification-inbox/schema/notification-inbox.schema";

export type NotificationItem = z.infer<typeof NotificationItemSchema>;
export type NotificationInbox = z.infer<typeof NotificationInboxSchema>;
export type NotificationReadAll = z.infer<typeof NotificationReadAllSchema>;
export type BackendNotification = z.infer<typeof BackendNotificationSchema>;

// Backward compatibility aliases
export type INotificationItem = NotificationItem;
export type INotificationInbox = NotificationInbox;
export type INotificationReadAll = NotificationReadAll;
export type IBackendNotification = BackendNotification;
