export const scheduleKeys = {
  all: ["schedule"] as const,
  appointments: (range: string, status: string, page: number) => ["schedule", "appointments", range, status, page] as const,
  hours: ["schedule", "hours"] as const,
};
