export interface INotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
}

export interface INotificationInbox {
  items: INotificationItem[];
  unreadCount: number;
  total: number;
}

export interface INotificationReadAll {
  updated: number;
  unreadCount: number;
}

export interface IBackendNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
}
