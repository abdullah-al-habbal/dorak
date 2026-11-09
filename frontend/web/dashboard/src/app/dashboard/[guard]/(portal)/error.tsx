"use client";

import { useEffect } from "react";

import { ErrorScreen } from "@/components/feedback/error-screen";

/** Sits inside the portal layout, so a failing screen keeps the sidebar and header. */
export default function PortalError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <ErrorScreen error={error} onRetry={retry} nested />;
}
