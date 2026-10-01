'use client';

import { useState } from 'react';
import { Navbar } from '@/shared/components/layout/navbar';
import { Sidebar } from '@/shared/components/layout/sidebar';
import type { DashboardShellProps } from '@/shared/types/components';

export function DashboardShell({ children, role }: Readonly<DashboardShellProps>) {
  const [menuOpen, setMenuOpen] = useState(false);

  return <div className="min-h-screen bg-background md:flex"><div className={menuOpen ? 'block md:hidden' : 'hidden'}><Sidebar role={role} /></div><Sidebar className="hidden md:block" role={role} /><div className="min-w-0 flex-1"><Navbar onOpenMenu={() => setMenuOpen((open) => !open)} /><main className="mx-auto max-w-7xl p-6">{children}</main></div></div>;
}
