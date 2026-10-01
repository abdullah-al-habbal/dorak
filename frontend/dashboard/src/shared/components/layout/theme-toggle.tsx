'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/shared/components/buttons/button';
import { useDashboardTranslation } from '@/shared/hooks/use-dashboard-translation';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const { t } = useDashboardTranslation();

  return <Button aria-label={t('common.toggleTheme')} onClick={() => setTheme(isDark ? 'light' : 'dark')} type="button" variant="ghost">{isDark ? <Sun size={18} /> : <Moon size={18} />}</Button>;
}
