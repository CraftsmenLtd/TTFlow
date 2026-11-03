import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  /** Shown as the card title on small screens. */
  primary?: boolean;
  align?: 'left' | 'right' | 'center';
}

interface ResponsiveTableProps<T> {
  caption: string;
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  emptyMessage?: string;
}

const alignClasses = { left: 'text-left', right: 'text-right', center: 'text-center' } as const;

/** A table on medium screens and up; a list of cards on phones, so the page never scrolls sideways. */
export function ResponsiveTable<T>({
  caption,
  columns,
  rows,
  getRowKey,
  emptyMessage = 'Nothing to show yet.',
}: ResponsiveTableProps<T>) {
  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-surface p-4 text-sm text-ink-secondary">
        {emptyMessage}
      </p>
    );
  }

  const primary = columns.find((c) => c.primary) ?? columns[0];
  const details = columns.filter((c) => c !== primary);

  return (
    <>
      <div className="hidden overflow-x-auto rounded-xl border border-border bg-surface md:block">
        <table className="w-full text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead className="bg-subtle">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    'px-4 py-3 font-semibold text-ink-secondary',
                    alignClasses[col.align ?? 'left'],
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={getRowKey(row)} className="hover:bg-hover">
                {columns.map((col) => (
                  <td key={col.key} className={cn('px-4 py-3', alignClasses[col.align ?? 'left'])}>
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul aria-label={caption} className="space-y-3 md:hidden">
        {rows.map((row) => (
          <li key={getRowKey(row)} className="rounded-xl border border-border bg-surface p-4">
            {primary && <div className="mb-2 font-semibold">{primary.cell(row)}</div>}
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              {details.map((col) => (
                <div key={col.key} className="contents">
                  <dt className="text-ink-muted">{col.header}</dt>
                  <dd className="text-right">{col.cell(row)}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}
