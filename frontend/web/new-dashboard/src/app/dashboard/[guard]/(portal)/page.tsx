import type { Metadata } from "next";

import { OverviewPanel } from "@/components/overview/overview-panel";

export const metadata: Metadata = { title: "Overview" };

export default function PortalOverviewPage() {
  return <OverviewPanel />;
}
