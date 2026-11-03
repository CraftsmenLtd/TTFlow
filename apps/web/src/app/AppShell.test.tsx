import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';
import { routes } from './routes';

function renderAt(path: string) {
  render(<RouterProvider router={createMemoryRouter(routes, { initialEntries: [path] })} />);
}

describe('AppShell', () => {
  it('marks the current page in both navigation bars', () => {
    renderAt('/fixtures');
    const current = screen.getAllByRole('link', { current: 'page' });
    expect(current.map((link) => link.textContent)).toEqual(['Fixtures', 'Fixtures']);
  });

  it('keeps the phone bottom bar to five items', () => {
    renderAt('/');
    const [, bottomBar] = screen.getAllByRole('navigation', { name: 'Primary' });
    expect(bottomBar?.querySelectorAll('li')).toHaveLength(5);
  });

  it('flags member-only pages as requiring login', () => {
    renderAt('/standings');
    expect(screen.getByText('Requires a company login.')).toBeInTheDocument();
  });

  it('shows a not-found page for unknown routes', () => {
    renderAt('/nope');
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
  });
});
