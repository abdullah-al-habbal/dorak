"use client";

import { Button } from "@/components/tailgrids/core/button";

interface RetryButtonProps {
  onRetry: () => void;
  children: React.ReactNode;
}

/** Error-boundary reset action. */
export function RetryButton({ onRetry, children }: RetryButtonProps) {
  return (
    <Button className="mt-4" appearance="outline" onPress={onRetry}>
      {children}
    </Button>
  );
}
