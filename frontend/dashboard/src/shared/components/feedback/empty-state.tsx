import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';

export function EmptyState({ action, description, icon: Icon = Inbox, title }: Readonly<{ action?: React.ReactNode; description?: string; icon?: LucideIcon; title: string }>) { return <section className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-8 text-center"><Icon aria-hidden="true" className="text-foreground" size={28} /><h2 className="font-semibold">{title}</h2>{description === undefined ? null : <p className="max-w-md text-sm text-foreground">{description}</p>}{action}</section>; }
