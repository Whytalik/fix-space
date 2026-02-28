'use client';

import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  loading?: boolean;
}

export function Button({ variant = 'primary', loading = false, children, disabled, className = '', ...rest }: ButtonProps) {
  const isDisabled = disabled || loading;

  const base = 'px-4 py-[11px] rounded-lg text-sm font-semibold transition-all duration-150';
  const state = isDisabled ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer';
  const variantCls =
    variant === 'primary'
      ? 'bg-accent text-white shadow-accent border-0 hover:bg-accent-hover'
      : 'bg-surface border border-stroke text-ink-secondary hover:text-ink hover:border-ink-muted';

  return (
    <button {...rest} disabled={isDisabled} className={`${base} ${state} ${variantCls} ${className}`}>
      {children}
    </button>
  );
}
