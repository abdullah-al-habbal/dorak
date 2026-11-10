import {
  BadgeDollarSignIcon,
  BarChart3Icon,
  BookOpenCheckIcon,
  BuildingIcon,
  ShieldCheckIcon,
  UserCheckIcon,
  ClipboardCheckIcon,
  CalendarClockIcon,
  ClockIcon,
  CreditCardIcon,
  LayersIcon,
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
    { key: "analytics", segment: "analytics", icon: BarChart3Icon, ready: true },
    { key: "bookings", segment: "bookings", icon: BookOpenCheckIcon, ready: true },
    { key: "brands", segment: "brands", icon: StoreIcon, ready: true },
    { key: "barberApprovals", segment: "barber-approvals", icon: UserCheckIcon, ready: true },
    { key: "branches", segment: "branches", icon: BuildingIcon, ready: true },
    { key: "catalog", segment: "catalog", icon: LibraryIcon, ready: true },
    { key: "reviews", segment: "reviews", icon: StarIcon, ready: true },
    { key: "payouts", segment: "payouts", icon: WalletIcon, ready: true },
    { key: "plans", segment: "plans", icon: LayersIcon, ready: true },
    { key: "subscriptions", segment: "subscriptions", icon: CreditCardIcon, ready: true },
    { key: "admins", segment: "admins", icon: ShieldCheckIcon, ready: true },
    { key: "settings", segment: "settings", icon: SettingsIcon, ready: true },
  ],
  [AuthActor.Manager]: [
    overview,
    { key: "bookings", segment: "bookings", icon: BookOpenCheckIcon, ready: true },
    { key: "chairs", segment: "chairs", icon: SofaIcon, ready: true },
    { key: "stylists", segment: "stylists", icon: UsersIcon, ready: true },
    { key: "services", segment: "services", icon: ScissorsIcon, ready: true },
    { key: "workingHours", segment: "working-hours", icon: ClockIcon, ready: true },
    { key: "earnings", segment: "earnings", icon: BadgeDollarSignIcon, ready: true },
    { key: "reviews", segment: "reviews", icon: StarIcon, ready: true },
  ],
  [AuthActor.Barber]: [
    overview,
    { key: "schedule", segment: "schedule", icon: CalendarClockIcon, ready: true },
    { key: "earnings", segment: "earnings", icon: BadgeDollarSignIcon, ready: true },
  ],
  [AuthActor.Owner]: [
    overview,
    { key: "status", segment: "status", icon: ClipboardCheckIcon, ready: true },
    { key: "bookings", segment: "bookings", icon: BookOpenCheckIcon, ready: true },
    { key: "branches", segment: "branches", icon: BuildingIcon, ready: true },
    { key: "stylists", segment: "stylists", icon: UsersIcon, ready: true },
    { key: "workingHours", segment: "working-hours", icon: ClockIcon, ready: true },
    { key: "earnings", segment: "earnings", icon: BadgeDollarSignIcon, ready: true },
    { key: "payouts", segment: "payouts", icon: WalletIcon, ready: true },
    { key: "subscription", segment: "subscription", icon: CreditCardIcon, ready: true },
  ],
};
