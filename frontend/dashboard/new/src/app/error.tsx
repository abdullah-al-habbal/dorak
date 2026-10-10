"use client";

import { CenteredStatus } from "@/components/status/centered-status";
import { RetryButton } from "@/components/status/retry-button";
import { useDictionary } from "@/hooks/use-dictionary";

export default function RootError({ reset }: { reset: () => void }) {
  const copy = useDictionary().common.status;

  return (
    <CenteredStatus title={copy.errorTitle}>
      <RetryButton onRetry={reset}>{copy.retry}</RetryButton>
    </CenteredStatus>
  );
}
