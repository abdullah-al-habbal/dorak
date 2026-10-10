"use client";

import { useEffect } from "react";
import { startNetworkHealthMonitoring } from "@/services/api/network-health";

export function useNetworkHealthMonitoring() {
  useEffect(() => startNetworkHealthMonitoring(), []);
}
