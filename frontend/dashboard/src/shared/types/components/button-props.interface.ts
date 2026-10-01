import type { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'default' | 'ghost' | 'outline';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}
