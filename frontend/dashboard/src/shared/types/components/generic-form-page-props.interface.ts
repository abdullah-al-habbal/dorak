import type { ReactNode } from 'react';

export interface GenericFormPageProps {
  cancelHref: string;
  children: ReactNode;
  isLoading?: boolean;
  isPending: boolean;
  formId: string;
  submitLabel: string;
  title: string;
}
