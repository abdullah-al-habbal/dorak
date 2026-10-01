'use client';

import { Building2, CalendarCheck, CalendarDays, LayoutDashboard, Scissors, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/shared/utils/cn';
import type { DashboardRole } from '@/shared/auth/dashboard-claim';
import { APP_ROUTES } from '@/shared/routes/dashboard-routes';

interface SidebarProps {
  className?: string;
  role: DashboardRole;
}

interface DashboardMenuItem {
  icon: typeof LayoutDashboard;
  label: string;
  path: string;
  platformOnly?: boolean;
}

const menuItems: DashboardMenuItem[] = [
  { icon: LayoutDashboard, label: 'Overview', path: '' },
  { icon: Building2, label: 'Branches', path: '/branches', platformOnly: true },
  { icon: CalendarCheck, label: 'Bookings', path: '/bookings' },
  { icon: Scissors, label: 'Services', path: '/services' },
  { icon: CalendarDays, label: 'Chairs', path: '/chairs' },
  { icon: Users, label: 'Stylists', path: '/stylists' },
];

export function Sidebar({ className, role }: Readonly<SidebarProps>) {
  const pathname = usePathname();
  const area = role === 'platform_admin' ? 'admin' : 'manager';
  const basePath = APP_ROUTES.dashboard(area);

  return <aside className={cn('min-h-screen w-60 border-e bg-surface p-4', className)}><Link className="mb-8 block text-lg font-semibold" href={basePath}>Dorak</Link><nav className="space-y-1">{menuItems.filter((item) => !item.platformOnly || role === 'platform_admin').map((item) => {
    const href = `${basePath}${item.path}`;
    const active = item.path === '' ? pathname === href : pathname.startsWith(href);
    const Icon = item.icon;

    return <Link className={cn('flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted', active && 'bg-muted font-medium')} href={href} key={item.path}><Icon size={18} />{item.label}</Link>;
  })}</nav></aside>;
}
