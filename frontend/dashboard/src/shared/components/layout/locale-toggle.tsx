'use client';

import { Languages } from 'lucide-react';
import { Button } from '@/shared/components/buttons/button';
import { useDashboardLocale } from '@/shared/hooks/use-dashboard-locale';

export function LocaleToggle() {
  const { locale, toggleLocale } = useDashboardLocale();

  return <Button aria-label="Toggle language" onClick={toggleLocale} type="button" variant="ghost"><Languages size={18} />{locale === 'en' ? 'AR' : 'EN'}</Button>;
}
