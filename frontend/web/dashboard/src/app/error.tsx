"use client";

import { ErrorScreen } from "@/components/feedback/error-screen";

export default function RootError({ error, retry }: { error: unknown; retry: () => void }) {
  return <ErrorScreen error={error} onRetry={retry} />;
}
