import { MATCH_STATUSES, MATCH_STATUS_LABELS } from '@spindesk/shared';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it.each(MATCH_STATUSES)('shows a text label for %s, not just a color', (status) => {
    render(<StatusBadge status={status} />);
    expect(screen.getByText(MATCH_STATUS_LABELS[status])).toBeVisible();
  });
});
