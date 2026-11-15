import { createQueryKeys } from "@/lib/core/query/create-query-keys.util";

export const scheduleKeys = createQueryKeys("schedule", {
  appointments: (range: string, status: string, page: number) =>
    ["appointments", range, status, page] as const,
  hours: ["hours"] as const,
});
