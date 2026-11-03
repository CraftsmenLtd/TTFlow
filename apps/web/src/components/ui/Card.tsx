import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface CardProps {
  title?: string;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function Card({ title, actions, className, children }: CardProps) {
  return (
    <section
      className={cn('rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6', className)}
    >
      {(title || actions) && (
        <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
          {title && <h2 className="text-lg font-semibold text-ink">{title}</h2>}
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}
