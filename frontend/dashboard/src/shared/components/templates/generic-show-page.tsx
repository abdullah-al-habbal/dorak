import { Breadcrumbs } from '@/shared/components/layout/breadcrumbs';
import type { GenericShowPageProps } from '@/shared/types/components';

export function GenericShowPage({ actions, details, title }: Readonly<GenericShowPageProps>) {
  return <section className="space-y-6"><Breadcrumbs /><header className="flex items-center justify-between gap-4"><h1 className="text-2xl font-semibold">{title}</h1>{actions}</header><dl className="grid gap-4 rounded-lg border bg-surface p-6 sm:grid-cols-2">{details.map((detail) => <div key={detail.label}><dt className="text-sm text-foreground">{detail.label}</dt><dd className="mt-1 font-medium">{detail.value}</dd></div>)}</dl></section>;
}
