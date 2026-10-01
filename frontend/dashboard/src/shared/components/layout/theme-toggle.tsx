'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/shared/components/buttons/button';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return <Button aria-label="Toggle color theme" onClick={() => setTheme(isDark ? 'light' : 'dark')} type="button" variant="ghost">{isDark ? <Sun size={18} /> : <Moon size={18} />}</Button>;
}
