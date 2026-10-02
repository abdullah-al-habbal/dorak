'use client';

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDashboardTranslation } from '@/shared/hooks/use-dashboard-translation';
import { APP_ROUTES } from '@/shared/routes/dashboard-routes';
import type { DashboardArea } from '@/shared/routes/dashboard-routes';

const DASHBOARD_AREAS: readonly string[] = ['admin', 'manager'];

function label(segment: string): string {
  return segment.replaceAll('-', ' ').replace(/\b\w/g, (character) => character.toUpperCase());
}

export function Breadcrumbs() {
  const { t } = useDashboardTranslation();
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const root = DASHBOARD_AREAS.includes(segments[0] ?? '')
    ? (segments[0] as DashboardArea)
    : undefined;

  return (
    <nav
      aria-label={t('common.breadcrumb')}
      className="flex flex-wrap items-center gap-1 text-sm text-foreground"
    >
      <Link href={root === undefined ? APP_ROUTES.login : APP_ROUTES.dashboard(root)}>
        {t('common.dashboard')}
      </Link>
      {segments.slice(1).map((segment, index) => (
        <span
          className="flex items-center gap-1"
          key={`/${segments.slice(0, index + 2).join('/')}`}
        >
          <ChevronRight size={14} />
          <span>{label(segment)}</span>
        </span>
      ))}
    </nav>
  );
}
