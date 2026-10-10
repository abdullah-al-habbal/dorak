import type { ComponentType } from 'react';
import type { DashboardMessageKey } from '@/shared/i18n/messages';

/**
 * A filter is declared once and drives both the URL and the list query:
 * `key` is the wire/URL name (`chair_id`), `param` is the camelCase field the
 * list request expects (`chairId`). `options` covers a static list; an entity
 * whose filter values come from the API supplies `renderOptions` instead.
 */
export type EntityFilter = {
  readonly key: string;
  readonly label: DashboardMessageKey;
  readonly options?: readonly { readonly label: string; readonly value: string }[];
  readonly param: string;
  readonly renderOptions?: ComponentType<{
    readonly onChange: (value: string) => void;
    readonly value: string;
  }>;
};
