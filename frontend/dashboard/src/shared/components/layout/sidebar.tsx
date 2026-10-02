'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DASHBOARD_MENU_ITEMS } from '@/shared/config/navigation';
import { useDashboardTranslation } from '@/shared/hooks/use-dashboard-translation';
import { APP_ROUTES } from '@/shared/routes/dashboard-routes';
import type { SidebarProps } from '@/shared/types/components/sidebar-props.interface';
import { cn } from '@/shared/utils/cn';

export function Sidebar({ className, role }: Readonly<SidebarProps>) {
  const pathname = usePathname();
  const area = role === 'platform_admin' ? 'admin' : 'manager';
  const basePath = APP_ROUTES.dashboard(area);
  const { t } = useDashboardTranslation();

  return (
    <aside className={cn('min-h-screen w-60 border-e bg-surface p-4', className)}>
      <Link className="mb-8 block text-lg font-semibold" href={basePath}>
        Dorak
      </Link>
      <nav className="space-y-1">
        {DASHBOARD_MENU_ITEMS.filter((item) => !item.platformOnly || role === 'platform_admin').map(
          (item) => {
            const href = item.path(area);
            const active = href === basePath ? pathname === href : pathname.startsWith(href);
            const Icon = item.icon;

            return (
              <Link
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted',
                  active && 'bg-muted font-medium',
                )}
                href={href}
                key={item.label}
              >
                <Icon size={18} />
                {t(item.label)}
              </Link>
            );
          },
        )}
      </nav>
    </aside>
  );
}
