'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

export interface ServerListParams {
  page: number;
  per_page: number;
  search?: string;
}

function positiveNumber(value: string | null, fallback: number): number {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function useServerQueryParams(): ServerListParams & { setPage: (page: number) => void; setSearch: (search: string) => void; setValue: (key: string, value: string) => void } {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useMemo(() => ({
    page: positiveNumber(searchParams.get('page'), 1),
    per_page: positiveNumber(searchParams.get('per_page'), 15),
    search: searchParams.get('search') ?? undefined,
  }), [searchParams]);
  const update = useCallback((values: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(values).forEach(([key, value]) => {
      if (value === undefined || value === '') next.delete(key);
      else next.set(key, value);
    });
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  return {
    ...params,
    setPage: (page) => update({ page: String(page) }),
    setSearch: (search) => update({ page: '1', search }),
    setValue: (key, value) => update({ page: '1', [key]: value }),
  };
}
