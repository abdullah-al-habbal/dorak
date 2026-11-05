"use client";

import { useNetworkHealthMessage } from "@/hooks/use-network-health-message";

export function NetworkHealthBanner() {
  const message = useNetworkHealthMessage();

  if (!message) return null;

  return (
    <div
      className="fixed inset-x-0 top-0 z-50 border-b border-card-border bg-card-surface-area px-4 py-3 text-center text-sm text-text-primary"
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
