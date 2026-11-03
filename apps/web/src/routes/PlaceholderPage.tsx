import { Lock } from 'lucide-react';
import { Card } from '../components/ui/Card';

interface PlaceholderPageProps {
  title: string;
  description: string;
  phase: string;
  /** Pages that show employee names need a company login (no public access). */
  membersOnly?: boolean;
}

export function PlaceholderPage({
  title,
  description,
  phase,
  membersOnly = false,
}: PlaceholderPageProps) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
      <Card>
        <p className="text-ink-secondary">{description}</p>
        <p className="mt-4 text-sm font-semibold text-ink">Planned for {phase}.</p>
        {membersOnly && (
          <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-ink-secondary">
            <Lock aria-hidden="true" className="size-4" />
            Requires a company login.
          </p>
        )}
      </Card>
    </div>
  );
}
