'use client';

import { chairsConfig } from '@/shared/entities/configs/chairs.config';
import { stylistsConfig } from '@/shared/entities/configs/stylists.config';
import { createEntityHooks } from '@/shared/entities/entity-hooks';
import { useDashboardTranslation } from '@/shared/hooks/use-dashboard-translation';

const chairHooks = createEntityHooks(chairsConfig);
const stylistHooks = createEntityHooks(stylistsConfig);

/**
 * Filter values come from the API rather than a static list, so the engine
 * hands the control its current URL value and a setter. Laravel scopes both
 * lists to the actor, so a branch manager only ever sees their own.
 */
export function ChairFilterOptions({
  onChange,
  value,
}: Readonly<{ onChange: (value: string) => void; value: string }>) {
  const { t } = useDashboardTranslation();
  const chairs = chairHooks.useEntities({ page: 1, per_page: 100 });
  return (
    <select
      className="rounded-lg border bg-surface px-3 py-2"
      onChange={(event) => onChange(event.target.value)}
      value={value}
    >
      <option value="">{t('bookings.allChairs')}</option>
      {chairs.data?.items.map((chair) => (
        <option key={chair.id} value={chair.id}>
          {chair.label ?? chair.id}
        </option>
      ))}
    </select>
  );
}

export function StylistFilterOptions({
  onChange,
  value,
}: Readonly<{ onChange: (value: string) => void; value: string }>) {
  const { t } = useDashboardTranslation();
  const stylists = stylistHooks.useEntities({ page: 1, per_page: 100 });
  return (
    <select
      className="rounded-lg border bg-surface px-3 py-2"
      onChange={(event) => onChange(event.target.value)}
      value={value}
    >
      <option value="">{t('bookings.allStylists')}</option>
      {stylists.data?.items.map((stylist) => (
        <option key={stylist.id} value={stylist.id}>
          {stylist.name.en}
        </option>
      ))}
    </select>
  );
}
