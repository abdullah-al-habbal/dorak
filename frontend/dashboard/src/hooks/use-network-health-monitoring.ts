"use client";

import { useEffect } from "react";
import { startNetworkHealthMonitoring } from "@/services/api/common/network-health/network-health";

export function useNetworkHealthMonitoring() {
  useEffect(() => startNetworkHealthMonitoring(), []);
}
