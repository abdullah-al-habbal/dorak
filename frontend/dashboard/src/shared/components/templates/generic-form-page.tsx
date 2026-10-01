'use client';

import Link from 'next/link';
import { Button } from '@/shared/components/buttons/button';
import { Skeleton } from '@/shared/components/feedback/skeleton';
import { Breadcrumbs } from '@/shared/components/layout/breadcrumbs';

interface GenericFormPageProps {
  cancelHref: string;
  children: React.ReactNode;
  isLoading?: boolean;
  isPending: boolean;
  formId: string;
  submitLabel: string;
  title: string;
}

export function GenericCreatePage(props: Readonly<GenericFormPageProps>) {
  return <GenericFormPage {...props} />;
}

export function GenericUpdatePage(props: Readonly<GenericFormPageProps>) {
  return <GenericFormPage {...props} />;
}

function GenericFormPage({ cancelHref, children, formId, isLoading = false, isPending, submitLabel, title }: Readonly<GenericFormPageProps>) {
  return <section className="space-y-6"><Breadcrumbs /><h1 className="text-2xl font-semibold">{title}</h1><div className="rounded-lg border bg-surface p-6">{isLoading ? <Skeleton className="h-64 w-full" /> : children}<div className="mt-6 flex justify-end gap-3"><Link className="rounded-lg border bg-surface px-3 py-2 text-sm" href={cancelHref}>Cancel</Link><Button disabled={isPending} form={formId} type="submit">{submitLabel}</Button></div></div></section>;
}
