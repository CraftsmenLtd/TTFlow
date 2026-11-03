import { fileURLToPath } from 'node:url';

// One stack in Mumbai, the closest region to Dhaka. There is no cloud dev
// environment: development and testing run locally and in CI.
export const STACK_NAME = 'SpinDesk';
export const REGION = 'ap-south-1';

export const REPO_ROOT = fileURLToPath(new URL('../../', import.meta.url));
