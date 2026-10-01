'use client';

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function label(segment: string): string {
  return segment.replaceAll('-', ' ').replace(/\b\w/g, (character) => character.toUpperCase());
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  return <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-foreground"><Link href={`/${segments[0] ?? ''}`}>Dashboard</Link>{segments.slice(1).map((segment, index) => <span className="flex items-center gap-1" key={`${segment}-${index}`}><ChevronRight size={14} /><span>{label(segment)}</span></span>)}</nav>;
}
