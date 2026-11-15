import type { Metadata } from "next";

import { GuardPicker } from "@/components/auth/forms/guard-picker";

export const metadata: Metadata = { title: "Choose your workspace" };

export default function DashboardIndexPage() {
  return <GuardPicker />;
}
