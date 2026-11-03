import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ResponsiveTable, type Column } from './ResponsiveTable';

interface Row {
  id: string;
  name: string;
  points: number;
}

const columns: Column<Row>[] = [
  { key: 'name', header: 'Player', cell: (r) => r.name, primary: true },
  { key: 'points', header: 'Points', cell: (r) => r.points, align: 'right' },
];

describe('ResponsiveTable', () => {
  it('renders the same rows as a table and as phone cards', () => {
    const rows = [
      { id: '1', name: 'Player A', points: 4 },
      { id: '2', name: 'Player B', points: 2 },
    ];
    render(
      <ResponsiveTable caption="Group A" columns={columns} rows={rows} getRowKey={(r) => r.id} />,
    );

    const table = screen.getByRole('table', { name: 'Group A' });
    expect(within(table).getAllByRole('row')).toHaveLength(3);
    expect(
      within(screen.getByRole('list', { name: 'Group A' })).getAllByRole('listitem'),
    ).toHaveLength(2);
  });

  it('shows the empty message when there are no rows', () => {
    render(
      <ResponsiveTable
        caption="Group A"
        columns={columns}
        rows={[]}
        getRowKey={(r) => r.id}
        emptyMessage="No players yet."
      />,
    );
    expect(screen.getByText('No players yet.')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
