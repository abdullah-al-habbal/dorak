import {
  BadgeDollarSignIcon,
  BarChart3Icon,
  BookOpenCheckIcon,
  BuildingIcon,
  CalendarClockIcon,
  ClockIcon,
  CreditCardIcon,
  LayoutDashboardIcon,
  LibraryIcon,
  ScissorsIcon,
  SettingsIcon,
  SofaIcon,
  StarIcon,
  StoreIcon,
  UsersIcon,
  WalletIcon,
} from "lucide-react";

import { AuthActor } from "@/enums/auth-actor.enum";
import type { NavItem } from "@/interfaces/nav-item.interface";

const overview: NavItem = { key: "overview", segment: "", icon: LayoutDashboardIcon, ready: true };

export const NAV_ITEMS: Record<AuthActor, readonly NavItem[]> = {
  [AuthActor.Admin]: [
    overview,
    { key: "analytics", segment: "analytics", icon: BarChart3Icon, ready: false },
    { key: "bookings", segment: "bookings", icon: BookOpenCheckIcon, ready: true },
    { key: "brands", segment: "brands", icon: StoreIcon, ready: false },
    { key: "branches", segment: "branches", icon: BuildingIcon, ready: false },
    { key: "catalog", segment: "catalog", icon: LibraryIcon, ready: false },
    { key: "payouts", segment: "payouts", icon: WalletIcon, ready: false },
    { key: "settings", segment: "settings", icon: SettingsIcon, ready: false },
  ],
  [AuthActor.Manager]: [
    overview,
    { key: "bookings", segment: "bookings", icon: BookOpenCheckIcon, ready: true },
    { key: "chairs", segment: "chairs", icon: SofaIcon, ready: true },
    { key: "stylists", segment: "stylists", icon: UsersIcon, ready: true },
    { key: "services", segment: "services", icon: ScissorsIcon, ready: true },
    { key: "workingHours", segment: "working-hours", icon: ClockIcon, ready: true },
    { key: "earnings", segment: "earnings", icon: BadgeDollarSignIcon, ready: true },
    { key: "reviews", segment: "reviews", icon: StarIcon, ready: false },
  ],
  [AuthActor.Barber]: [
    overview,
    { key: "schedule", segment: "schedule", icon: CalendarClockIcon, ready: false },
    { key: "earnings", segment: "earnings", icon: BadgeDollarSignIcon, ready: true },
  ],
  [AuthActor.Owner]: [
    overview,
    { key: "bookings", segment: "bookings", icon: BookOpenCheckIcon, ready: true },
    { key: "branches", segment: "branches", icon: BuildingIcon, ready: false },
    { key: "stylists", segment: "stylists", icon: UsersIcon, ready: true },
    { key: "workingHours", segment: "working-hours", icon: ClockIcon, ready: true },
    { key: "earnings", segment: "earnings", icon: BadgeDollarSignIcon, ready: true },
    { key: "payouts", segment: "payouts", icon: WalletIcon, ready: false },
    { key: "subscription", segment: "subscription", icon: CreditCardIcon, ready: false },
  ],
};
