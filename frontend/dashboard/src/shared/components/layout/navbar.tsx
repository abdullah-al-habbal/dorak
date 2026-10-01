'use client';

import { Menu, UserCircle } from 'lucide-react';
import { Button } from '@/shared/components/buttons/button';
import { LocaleToggle } from '@/shared/components/layout/locale-toggle';
import { ThemeToggle } from '@/shared/components/layout/theme-toggle';

interface NavbarProps {
  onOpenMenu: () => void;
}

export function Navbar({ onOpenMenu }: Readonly<NavbarProps>) {
  return <header className="flex h-16 items-center justify-between border-b bg-surface px-4"><Button aria-label="Open navigation" className="md:hidden" onClick={onOpenMenu} type="button" variant="ghost"><Menu size={18} /></Button><div className="ms-auto flex items-center gap-2"><LocaleToggle /><ThemeToggle /><Button aria-label="Profile menu" type="button" variant="ghost"><UserCircle size={20} /></Button></div></header>;
}
