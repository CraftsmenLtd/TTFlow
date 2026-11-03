import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { initials } from '../../lib/initials';
import { Avatar } from './Avatar';

describe('initials', () => {
  it.each([
    ['Jane Doe', 'JD'],
    ['jane', 'J'],
    ['  Jane   Middle   Doe ', 'JD'],
    ['', '?'],
  ])('%j -> %j', (name, expected) => expect(initials(name)).toBe(expected));
});

describe('Avatar', () => {
  it('falls back to locally drawn initials', () => {
    render(<Avatar name="Jane Doe" />);
    expect(screen.getByRole('img', { name: 'Jane Doe' })).toHaveTextContent('JD');
  });

  it('uses the photo when there is one', () => {
    render(<Avatar name="Jane Doe" src="/photo.webp" />);
    expect(screen.getByRole('img', { name: 'Jane Doe' })).toHaveAttribute('src', '/photo.webp');
  });
});
