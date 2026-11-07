export const adminSubscriptionKeys = {
  all: ["admin-subscriptions"] as const,
  list: (status: string, page: number) => ["admin-subscriptions", "list", status, page] as const,
};
