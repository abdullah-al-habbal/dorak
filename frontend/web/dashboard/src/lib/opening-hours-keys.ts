export const openingHoursKeys = {
  branch: (branchId: string) => ["opening-hours", branchId] as const,
  // Branch options feed the picker only; a schedule save must not refetch them.
  branches: ["branch-options"] as const,
};
