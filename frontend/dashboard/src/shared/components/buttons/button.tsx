import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/shared/utils/cn';

type ButtonVariant = 'default' | 'ghost' | 'outline';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variants: Record<ButtonVariant, string> = {
  default: 'bg-primary text-background hover:opacity-90',
  ghost: 'bg-transparent text-foreground hover:bg-muted',
  outline: 'border bg-surface text-foreground hover:bg-muted',
};

export function Button({ className, variant = 'default', ...props }: Readonly<ButtonProps>) {
  return <button className={cn('inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm disabled:opacity-50', variants[variant], className)} {...props} />;
}
