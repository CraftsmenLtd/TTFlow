import { Stack, Validations, type App, type StackProps } from 'aws-cdk-lib';
import { AwsSolutionsChecks } from 'cdk-nag';
import type { Construct } from 'constructs';
import { Api } from './api';
import { BudgetAlert } from './budget-alert';
import { REGION, STACK_NAME } from './config';
import { Data } from './data';
import { Web } from './web';

interface SpinDeskStackProps extends StackProps {
  /** Built SPA (apps/web/dist). When omitted the site files are not deployed (e.g. in tests). */
  siteAssetPath?: string;
  alertEmail?: string;
}

/** The whole app in one stack. No WAF, KMS or other paid extras (see COST_ESTIMATE.md). */
export class SpinDeskStack extends Stack {
  readonly data: Data;
  readonly api: Api;
  readonly web: Web;

  constructor(scope: Construct, id: string, props: SpinDeskStackProps) {
    super(scope, id, props);

    this.data = new Data(this, 'Data');
    this.api = new Api(this, 'Api', {
      appTable: this.data.appTable,
      auditTable: this.data.auditTable,
    });
    this.web = new Web(this, 'Web', {
      apiDomain: this.api.apiDomain,
      logsBucket: this.data.logsBucket,
      mediaBucket: this.data.mediaBucket,
      siteAssetPath: props.siteAssetPath,
    });
    if (props.alertEmail) new BudgetAlert(this, 'Budget', { alertEmail: props.alertEmail });
  }
}

interface BuildOptions {
  account: string;
  siteAssetPath?: string;
  alertEmail?: string;
}

/** Shared by `bin/app.ts` and the infra tests. */
export function buildSpinDesk(app: App, { account, siteAssetPath, alertEmail }: BuildOptions) {
  const stack = new SpinDeskStack(app, STACK_NAME, {
    env: { account, region: REGION },
    tags: { project: 'spindesk' },
    siteAssetPath,
    alertEmail,
  });

  // ISO evidence: every synth is checked against the AWS Solutions rule pack, and
  // each acknowledged finding is written into the template metadata with its reason.
  Validations.of(app).addPlugins(
    new AwsSolutionsChecks(app, { verbose: true, writeSuppressionsToCloudFormation: true }),
  );

  return stack;
}
