export const adminPayoutKeys = {
  all: ["admin-payouts"] as const,
  list: (status: string, page: number) => ["admin-payouts", "list", status, page] as const,
};
