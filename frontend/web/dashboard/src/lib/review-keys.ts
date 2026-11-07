export const reviewKeys = {
  all: ["reviews"] as const,
  list: (branchId: string, page: number) => ["reviews", "list", branchId, page] as const,
};
