import { MATCH_STATUS_LABELS, type MatchStatus } from '@spindesk/shared';
import { cn } from '../../lib/cn';

// Tinted background + colored dot + ink label: status is never conveyed by
// color alone, and the label always meets WCAG AA contrast.
const toneClasses: Record<MatchStatus, { badge: string; dot: string }> = {
  LIVE: { badge: 'bg-live-tint', dot: 'bg-live motion-safe:animate-pulse' },
  COMPLETED: { badge: 'bg-success-tint', dot: 'bg-success' },
  SCHEDULED: { badge: 'bg-info-tint', dot: 'bg-info' },
  RESCHEDULE_PENDING: { badge: 'bg-warning-tint', dot: 'bg-warning' },
  WALKOVER: { badge: 'bg-danger-tint', dot: 'bg-danger' },
};

interface StatusBadgeProps {
  status: MatchStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const tone = toneClasses[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold text-ink',
        tone.badge,
        className,
      )}
    >
      <span aria-hidden="true" className={cn('size-2 rounded-full', tone.dot)} />
      {MATCH_STATUS_LABELS[status]}
    </span>
  );
}
