import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Tabs } from './Tabs';

const tabs = [
  { id: 'a', label: 'Alpha', content: <p>Alpha panel</p> },
  { id: 'b', label: 'Beta', content: <p>Beta panel</p> },
  { id: 'c', label: 'Gamma', content: <p>Gamma panel</p> },
];

describe('Tabs', () => {
  it('moves between tabs with arrow keys, Home and End', async () => {
    const user = userEvent.setup();
    render(<Tabs label="Events" tabs={tabs} />);

    const alpha = screen.getByRole('tab', { name: 'Alpha' });
    expect(alpha).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Alpha panel')).toBeVisible();

    alpha.focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Beta' })).toHaveFocus();
    expect(screen.getByText('Beta panel')).toBeVisible();
    expect(screen.getByText('Alpha panel')).not.toBeVisible();

    await user.keyboard('{End}');
    expect(screen.getByRole('tab', { name: 'Gamma' })).toHaveAttribute('aria-selected', 'true');

    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveFocus();
  });
});
