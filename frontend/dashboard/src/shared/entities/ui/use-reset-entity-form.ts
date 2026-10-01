'use client';

import { useEffect } from 'react';
import type { FieldValues, UseFormReset } from 'react-hook-form';

export function useResetEntityForm<TValues extends FieldValues>(
  values: TValues | undefined,
  reset: UseFormReset<TValues>,
): void {
  useEffect(() => {
    if (values !== undefined) {
      reset(values);
    }
  }, [reset, values]);
}
