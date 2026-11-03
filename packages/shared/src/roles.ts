// Every signed-in user is a player. SCORER and ADMIN add capabilities on top,
// so a user holds exactly one of these roles.
export const ROLES = ['PLAYER', 'SCORER', 'ADMIN'] as const;
export type Role = (typeof ROLES)[number];

const EVERYONE = ['PLAYER', 'SCORER', 'ADMIN'] as const;
const SCORERS = ['SCORER', 'ADMIN'] as const;
const ADMINS = ['ADMIN'] as const;

// Single source of truth for authorization. The API enforces it; the web app
// only uses it to hide controls a user cannot use.
export const PERMISSIONS = {
  'tournament:view': EVERYONE,
  'profile:edit-own': EVERYONE,
  'registration:submit': EVERYONE,
  'reschedule:request': EVERYONE,
  'feedback:submit': EVERYONE,
  'match:score': SCORERS,
  'users:manage': ADMINS,
  'draw:manage': ADMINS,
  'schedule:manage': ADMINS,
  'reschedule:decide': ADMINS,
  'walkover:record': ADMINS,
  'rules:publish': ADMINS,
  'feedback:triage': ADMINS,
  'settings:manage': ADMINS,
  'audit:view': ADMINS,
} as const satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof PERMISSIONS;

export function can(role: Role | undefined, permission: Permission): boolean {
  if (!role) return false;
  return (PERMISSIONS[permission] as readonly Role[]).includes(role);
}

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value);
}
