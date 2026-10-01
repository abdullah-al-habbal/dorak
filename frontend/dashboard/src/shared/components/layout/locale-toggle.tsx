'use client';

import { Languages } from 'lucide-react';
import { Button } from '@/shared/components/buttons/button';
import { useDashboardLocale } from '@/shared/hooks/use-dashboard-locale';
import { useDashboardTranslation } from '@/shared/hooks/use-dashboard-translation';

export function LocaleToggle() {
  const { locale, toggleLocale } = useDashboardLocale();
  const { t } = useDashboardTranslation();

  return <Button aria-label={t('common.toggleLanguage')} onClick={toggleLocale} type="button" variant="ghost"><Languages size={18} />{locale === 'en' ? 'AR' : 'EN'}</Button>;
}
