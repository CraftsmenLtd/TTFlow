import type { ButtonHTMLAttributes } from 'react';
import { Link, type LinkProps } from 'react-router';
import { cn } from '../../lib/cn';

type Variant = 'primary' | 'secondary' | 'accent' | 'destructive' | 'ghost';
type Size = 'md' | 'lg';

const variantClasses: Record<Variant, string> = {
  primary: 'bg-brand text-on-brand hover:bg-brand-hover',
  secondary: 'border border-border-strong bg-surface text-brand hover:bg-subtle',
  // Ink text: white on action orange fails WCAG AA.
  accent: 'bg-action text-ink hover:bg-action-hover',
  destructive: 'bg-danger text-white hover:bg-danger-hover',
  ghost: 'text-brand hover:bg-hover',
};

// Both sizes keep a 44px minimum touch target.
const sizeClasses: Record<Size, string> = {
  md: 'min-h-11 px-4 text-sm',
  lg: 'min-h-12 px-6 text-base',
};

function buttonClassName(variant: Variant = 'primary', size: Size = 'md'): string {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors',
    'disabled:cursor-not-allowed disabled:opacity-50',
    variantClasses[variant],
    sizeClasses[size],
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant, size, className, type = 'button', ...props }: ButtonProps) {
  return (
    <button type={type} className={cn(buttonClassName(variant, size), className)} {...props} />
  );
}

interface ButtonLinkProps extends LinkProps {
  variant?: Variant;
  size?: Size;
}

export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <Link className={cn(buttonClassName(variant, size), className)} {...props} />;
}
