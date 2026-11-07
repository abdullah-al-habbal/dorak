export const payoutKeys = {
  all: ["payouts"] as const,
  list: (status: string, page: number) => ["payouts", "list", status, page] as const,
};
