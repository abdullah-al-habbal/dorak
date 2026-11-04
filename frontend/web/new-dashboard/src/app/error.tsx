"use client";

import { ErrorScreen } from "@/components/feedback/error-screen";

export default function RootError({ retry }: { error: unknown; retry: () => void }) {
  return <ErrorScreen onRetry={retry} />;
}
