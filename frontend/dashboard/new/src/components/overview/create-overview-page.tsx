import { OverviewDashboard } from "@/components/overview/overview-dashboard";

export function createOverviewPage() {
  return function OverviewPage() { return <OverviewDashboard />; };
}
