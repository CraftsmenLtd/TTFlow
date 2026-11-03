import { describe, expect, it } from 'vitest';
import { PERMISSIONS, can, isRole, type Permission } from './roles';

const permissions = Object.keys(PERMISSIONS) as Permission[];

describe('can', () => {
  it('denies everything to anonymous visitors', () => {
    for (const p of permissions) expect(can(undefined, p)).toBe(false);
  });

  it('grants admins every permission', () => {
    for (const p of permissions) expect(can('ADMIN', p)).toBe(true);
  });

  it('lets scorers score but not administer', () => {
    expect(can('SCORER', 'match:score')).toBe(true);
    expect(can('SCORER', 'users:manage')).toBe(false);
    expect(can('SCORER', 'walkover:record')).toBe(false);
  });

  it('keeps players read-only apart from their own actions', () => {
    expect(can('PLAYER', 'tournament:view')).toBe(true);
    expect(can('PLAYER', 'reschedule:request')).toBe(true);
    expect(can('PLAYER', 'match:score')).toBe(false);
    expect(can('PLAYER', 'rules:publish')).toBe(false);
  });

  it('gives scorers everything players have', () => {
    for (const p of permissions) if (can('PLAYER', p)) expect(can('SCORER', p)).toBe(true);
  });
});

describe('isRole', () => {
  it('accepts known roles only', () => {
    expect(isRole('ADMIN')).toBe(true);
    expect(isRole('admin')).toBe(false);
    expect(isRole('SUPERUSER')).toBe(false);
    expect(isRole(undefined)).toBe(false);
  });
});
