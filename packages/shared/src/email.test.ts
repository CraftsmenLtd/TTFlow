import { describe, expect, it } from 'vitest';
import { isAllowedEmail, normalizeEmail } from './email';

describe('isAllowedEmail', () => {
  it.each([
    'jane@craftsmensoftware.com',
    'Jane.Doe@CraftsmenSoftware.com',
    '  jane@craftsmensoftware.com ',
  ])('accepts company address %j', (email) => expect(isAllowedEmail(email)).toBe(true));

  it.each([
    'jane@gmail.com',
    'jane@craftsmensoftware.com.evil.com',
    'jane@mail.craftsmensoftware.com',
    'jane@craftsmensoftwareXcom',
    'jane@evilcraftsmensoftware.com',
    'craftsmensoftware.com',
    '@craftsmensoftware.com',
    'ja ne@craftsmensoftware.com',
    '',
  ])('rejects %j', (email) => expect(isAllowedEmail(email)).toBe(false));
});

describe('normalizeEmail', () => {
  it('trims and lowercases', () => {
    expect(normalizeEmail('  Jane@CraftsmenSoftware.COM ')).toBe('jane@craftsmensoftware.com');
  });
});
