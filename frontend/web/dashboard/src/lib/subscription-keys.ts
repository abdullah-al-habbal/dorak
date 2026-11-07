export const subscriptionKeys = {
  all: ["subscription"] as const,
  current: () => ["subscription", "current"] as const,
};
