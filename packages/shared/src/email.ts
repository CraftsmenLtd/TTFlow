export const ALLOWED_EMAIL_DOMAIN = 'craftsmensoftware.com';

// Exact domain only: rejects subdomains and look-alikes such as
// `x@craftsmensoftware.com.evil.com` or `x@mail.craftsmensoftware.com`.
const ALLOWED_EMAIL_PATTERN = /^[^\s@]+@craftsmensoftware\.com$/;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isAllowedEmail(email: string): boolean {
  return ALLOWED_EMAIL_PATTERN.test(normalizeEmail(email));
}
