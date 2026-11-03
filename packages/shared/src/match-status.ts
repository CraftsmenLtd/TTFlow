export const MATCH_STATUSES = [
  'SCHEDULED',
  'LIVE',
  'COMPLETED',
  'RESCHEDULE_PENDING',
  'WALKOVER',
] as const;
export type MatchStatus = (typeof MATCH_STATUSES)[number];

// Statuses are always shown with a text label, never by color alone.
export const MATCH_STATUS_LABELS: Record<MatchStatus, string> = {
  SCHEDULED: 'Scheduled',
  LIVE: 'Live',
  COMPLETED: 'Completed',
  RESCHEDULE_PENDING: 'Reschedule pending',
  WALKOVER: 'Walkover',
};
