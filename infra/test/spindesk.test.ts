import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { App } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { describe, expect, it } from 'vitest';
import { buildSpinDesk } from '../lib/spindesk-stack';

// Same feature flags as `cdk synth`, so tests see the templates that would be deployed.
const { context } = JSON.parse(readFileSync(new URL('../cdk.json', import.meta.url), 'utf8'));

function build(options: { siteAssetPath?: string; alertEmail?: string } = {}) {
  const app = new App({ context });
  const stack = buildSpinDesk(app, { account: '111111111111', ...options });
  return { app, stack, template: () => Template.fromStack(stack) };
}

function fakeSiteBuild(): string {
  const dir = mkdtempSync(join(tmpdir(), 'spindesk-site-'));
  writeFileSync(join(dir, 'index.html'), '<!doctype html><title>test</title>');
  return dir;
}

describe('cdk-nag gate', () => {
  it('synthesizes with no unacknowledged AwsSolutions findings', () => {
    const { app } = build();
    expect(() => app.synth()).not.toThrow();
  });

  it('still passes when the site deployment (CDK-managed Lambda) is included', () => {
    const { app } = build({ siteAssetPath: fakeSiteBuild() });
    expect(() => app.synth()).not.toThrow();
  });

  it('fails synthesis when an insecure resource is added', () => {
    const { app, stack } = build();
    new Bucket(stack, 'Insecure');
    expect(() => app.synth()).toThrow(/AwsSolutions-S10/);
  });
});

describe('cost decisions (COST_ESTIMATE.md)', () => {
  it('deploys everything as one stack in one region', () => {
    const { app } = build({ siteAssetPath: fakeSiteBuild() });
    const stacks = app.synth().stacks;
    expect(stacks.map((s) => [s.stackName, s.environment.region])).toEqual([
      ['SpinDesk', 'ap-south-1'],
    ]);
  });

  it('creates no KMS keys, WAF or Secrets Manager secrets', () => {
    const template = build().template();
    template.resourceCountIs('AWS::KMS::Key', 0);
    template.resourceCountIs('AWS::WAFv2::WebACL', 0);
    template.resourceCountIs('AWS::SecretsManager::Secret', 0);
    for (const table of Object.values(template.findResources('AWS::DynamoDB::GlobalTable'))) {
      expect(table.Properties.SSESpecification?.SSEType).not.toBe('KMS');
    }
  });

  it('adds the budget alert only when an email is given', () => {
    build().template().resourceCountIs('AWS::Budgets::Budget', 0);
    build({ alertEmail: 'owner@craftsmensoftware.com' })
      .template()
      .hasResourceProperties('AWS::Budgets::Budget', {
        Budget: Match.objectLike({ BudgetLimit: { Amount: 5, Unit: 'USD' } }),
      });
  });
});

describe('data', () => {
  it('enables point-in-time recovery and deletion protection on every table', () => {
    const tables = build().template().findResources('AWS::DynamoDB::GlobalTable');
    expect(Object.keys(tables)).toHaveLength(2);
    for (const table of Object.values(tables)) {
      expect(table.Properties.Replicas[0]).toMatchObject({
        PointInTimeRecoverySpecification: { PointInTimeRecoveryEnabled: true },
        DeletionProtectionEnabled: true,
      });
    }
  });

  it('blocks public access on every bucket', () => {
    build()
      .template()
      .allResourcesProperties('AWS::S3::Bucket', {
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: true,
          BlockPublicPolicy: true,
          IgnorePublicAcls: true,
          RestrictPublicBuckets: true,
        },
      });
  });
});

describe('api', () => {
  it('can only append to the audit table', () => {
    const statements = Object.values(build().template().findResources('AWS::IAM::Policy')).flatMap(
      (policy) =>
        policy.Properties.PolicyDocument.Statement as {
          Action: string | string[];
          Resource: unknown;
        }[],
    );
    const auditStatements = statements.filter((s) =>
      JSON.stringify(s.Resource).includes('AuditTable'),
    );
    expect(auditStatements).toHaveLength(1);
    expect(auditStatements[0]?.Action).toBe('dynamodb:PutItem');
  });

  it('throttles the API and logs access', () => {
    build()
      .template()
      .hasResourceProperties('AWS::ApiGatewayV2::Stage', {
        StageName: '$default',
        DefaultRouteSettings: { ThrottlingRateLimit: 50, ThrottlingBurstLimit: 100 },
        AccessLogSettings: Match.objectLike({ DestinationArn: Match.anyValue() }),
      });
  });
});

describe('web', () => {
  it('serves HTTPS only through CloudFront with /api routed to the API', () => {
    build()
      .template()
      .hasResourceProperties('AWS::CloudFront::Distribution', {
        DistributionConfig: Match.objectLike({
          DefaultCacheBehavior: Match.objectLike({ ViewerProtocolPolicy: 'redirect-to-https' }),
          CacheBehaviors: [
            Match.objectLike({ PathPattern: '/api/*', ViewerProtocolPolicy: 'https-only' }),
          ],
          Logging: Match.objectLike({ Prefix: 'cloudfront/' }),
        }),
      });
  });

  it('sends a strict content security policy', () => {
    build()
      .template()
      .hasResourceProperties('AWS::CloudFront::ResponseHeadersPolicy', {
        ResponseHeadersPolicyConfig: Match.objectLike({
          SecurityHeadersConfig: Match.objectLike({
            ContentSecurityPolicy: Match.objectLike({
              ContentSecurityPolicy: Match.anyValue(),
              Override: true,
            }),
            FrameOptions: { FrameOption: 'DENY', Override: true },
          }),
        }),
      });
  });
});
