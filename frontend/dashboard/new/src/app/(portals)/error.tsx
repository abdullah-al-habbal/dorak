"use client";

import { RetryButton } from "@/components/status/retry-button";
import { StatusMessage } from "@/components/status/status-message";
import { useDictionary } from "@/hooks/use-dictionary";

export default function PortalError({ reset }: { reset: () => void }) {
  const copy = useDictionary().portal;

  return (
    <main className="p-6">
      <StatusMessage>{copy.errorTitle}</StatusMessage>
      <RetryButton onRetry={reset}>{copy.retry}</RetryButton>
    </main>
  );
}
