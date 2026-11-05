import { z } from "zod";

export const NotificationItemSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  body: z.string(),
  data: z.record(z.string(), z.unknown()),
  readAt: z.string().nullable(),
  createdAt: z.string(),
});

export const NotificationInboxSchema = z.object({
  items: z.array(NotificationItemSchema),
  unreadCount: z.number(),
  total: z.number(),
});

export const NotificationReadAllSchema = z.object({
  updated: z.number(),
  unreadCount: z.number(),
});

export const BackendNotificationSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  body: z.string(),
  data: z.record(z.string(), z.unknown()).nullable().optional(),
  read_at: z.string().nullable(),
  created_at: z.string(),
});
