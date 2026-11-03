import { join } from 'node:path';
import { Duration, Fn, RemovalPolicy, Validations } from 'aws-cdk-lib';
import {
  HttpApi,
  HttpMethod,
  HttpStage,
  LogGroupLogDestination,
} from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import type { TableV2 } from 'aws-cdk-lib/aws-dynamodb';
import { Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, OutputFormat } from 'aws-cdk-lib/aws-lambda-nodejs';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import { REPO_ROOT } from './config';

interface ApiProps {
  appTable: TableV2;
  auditTable: TableV2;
}

export class Api extends Construct {
  /** Host name of the HTTP API, used as the CloudFront `/api/*` origin. */
  readonly apiDomain: string;

  constructor(scope: Construct, id: string, props: ApiProps) {
    super(scope, id);
    const { appTable, auditTable } = props;

    const logDefaults = {
      retention: RetentionDays.ONE_MONTH,
      removalPolicy: RemovalPolicy.DESTROY,
    };
    const functionLogs = new LogGroup(this, 'FunctionLogs', logDefaults);
    const accessLogs = new LogGroup(this, 'AccessLogs', logDefaults);

    // Own role instead of the AWS managed basic-execution policy: write access to this log group only.
    const role = new Role(this, 'FunctionRole', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
    });
    functionLogs.grantWrite(role);

    const fn = new NodejsFunction(this, 'Function', {
      entry: join(REPO_ROOT, 'services/api/src/lambda.ts'),
      projectRoot: REPO_ROOT,
      depsLockFilePath: join(REPO_ROOT, 'package-lock.json'),
      runtime: Runtime.NODEJS_24_X,
      architecture: Architecture.ARM_64,
      memorySize: 512,
      timeout: Duration.seconds(10),
      role,
      logGroup: functionLogs,
      environment: {
        APP_TABLE_NAME: appTable.tableName,
        AUDIT_TABLE_NAME: auditTable.tableName,
        NODE_OPTIONS: '--enable-source-maps',
      },
      bundling: {
        format: OutputFormat.ESM,
        target: 'node24',
        minify: true,
        sourceMap: true,
        mainFields: ['module', 'main'],
      },
    });

    appTable.grantReadWriteData(fn);
    auditTable.grant(fn, 'dynamodb:PutItem');

    const api = new HttpApi(this, 'HttpApi', {
      apiName: 'spindesk-api',
      createDefaultStage: false,
    });
    new HttpStage(this, 'DefaultStage', {
      httpApi: api,
      stageName: '$default',
      autoDeploy: true,
      throttle: { rateLimit: 50, burstLimit: 100 },
      accessLogSettings: { destination: new LogGroupLogDestination(accessLogs) },
    });

    const [healthRoute] = api.addRoutes({
      path: '/api/v1/health',
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration('Integration', fn),
    });
    if (healthRoute) {
      Validations.of(healthRoute).acknowledge({
        id: 'AwsSolutions-APIG4',
        reason:
          'Public health check with no data. Feature routes use the Cognito JWT authorizer (Phase 1).',
      });
    }

    // https://<id>.execute-api.<region>.amazonaws.com -> <id>.execute-api.<region>.amazonaws.com
    this.apiDomain = Fn.select(2, Fn.split('/', api.apiEndpoint));
  }
}
