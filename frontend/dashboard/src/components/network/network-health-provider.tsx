"use client";

import { useNetworkHealthMonitoring } from "@/hooks/use-network-health-monitoring";

export function NetworkHealthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useNetworkHealthMonitoring();

  return children;
}
