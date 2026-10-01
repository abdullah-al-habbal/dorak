import type { ReactNode } from 'react';
import type { DetailItem } from '@/shared/types/components/detail-item.interface';

export interface GenericShowPageProps {
  actions?: ReactNode;
  details: DetailItem[];
  title: string;
}
