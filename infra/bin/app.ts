import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { App } from 'aws-cdk-lib';
import { REPO_ROOT } from '../lib/config';
import { buildSpinDesk } from '../lib/spindesk-stack';

// Usage: cdk synth [-c account=123456789012] [-c alertEmail=owner@craftsmensoftware.com]
const app = new App();

// Deploy only to the company AWS account (docs/ISO-COMPLIANCE.md 2.1).
const account = process.env.CDK_DEFAULT_ACCOUNT ?? app.node.tryGetContext('account');
if (!account)
  throw new Error('No AWS account: sign in with `aws sso login` or pass -c account=<id> to synth.');

const siteAssetPath = join(REPO_ROOT, 'apps/web/dist');
if (!existsSync(siteAssetPath))
  console.warn('apps/web/dist not found: run `npm run build` to include the site.');

buildSpinDesk(app, {
  account,
  siteAssetPath: existsSync(siteAssetPath) ? siteAssetPath : undefined,
  alertEmail: app.node.tryGetContext('alertEmail'),
});
