import type { InputHTMLAttributes } from 'react';
import { cn } from '@/shared/utils/cn';
export function Input({ className, ...props }: Readonly<InputHTMLAttributes<HTMLInputElement>>) {
  return <input className={cn('rounded-lg border bg-surface px-3 py-2', className)} {...props} />;
}
