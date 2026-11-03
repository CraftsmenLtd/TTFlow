import { CfnOutput, Duration, RemovalPolicy, Stack, Validations } from 'aws-cdk-lib';
import {
  AllowedMethods,
  CachePolicy,
  Distribution,
  Function as CloudFrontFunction,
  FunctionCode,
  FunctionEventType,
  FunctionRuntime,
  HeadersFrameOption,
  HeadersReferrerPolicy,
  HttpVersion,
  OriginProtocolPolicy,
  OriginRequestPolicy,
  PriceClass,
  ResponseHeadersPolicy,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { HttpOrigin, S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import {
  BlockPublicAccess,
  Bucket,
  BucketEncryption,
  type CfnBucket,
  type IBucket,
} from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import { REGION } from './config';

interface WebProps {
  apiDomain: string;
  logsBucket: IBucket;
  mediaBucket: IBucket;
  /** Built SPA (apps/web/dist). When omitted the site files are not deployed (e.g. in tests). */
  siteAssetPath?: string;
}

// Client-side routes have no file extension; serve the SPA shell for them.
const SPA_REWRITE = `
function handler(event) {
  var request = event.request;
  var last = request.uri.split('/').pop();
  if (last.indexOf('.') === -1) request.uri = '/index.html';
  return request;
}`;

export class Web extends Construct {
  constructor(scope: Construct, id: string, props: WebProps) {
    super(scope, id);
    const { apiDomain, logsBucket, mediaBucket, siteAssetPath } = props;

    // Build output only, so it is always safe to delete and redeploy.
    const siteBucket = new Bucket(this, 'SiteBucket', {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      serverAccessLogsBucket: logsBucket,
      serverAccessLogsPrefix: 'site/',
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const media = `https://${mediaBucket.bucketRegionalDomainName}`;
    const csp = [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self'",
      `img-src 'self' data: blob: ${media}`,
      `connect-src 'self' https://cognito-idp.${REGION}.amazonaws.com ${media}`,
      "font-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      'upgrade-insecure-requests',
    ].join('; ');

    const securityHeaders = new ResponseHeadersPolicy(this, 'SecurityHeaders', {
      securityHeadersBehavior: {
        contentSecurityPolicy: { contentSecurityPolicy: csp, override: true },
        strictTransportSecurity: {
          accessControlMaxAge: Duration.days(365),
          includeSubdomains: true,
          override: true,
        },
        contentTypeOptions: { override: true },
        frameOptions: { frameOption: HeadersFrameOption.DENY, override: true },
        referrerPolicy: {
          referrerPolicy: HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
          override: true,
        },
      },
      customHeadersBehavior: {
        customHeaders: [
          {
            header: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
            override: true,
          },
          { header: 'X-Robots-Tag', value: 'noindex, nofollow', override: true },
        ],
      },
    });

    const spaRewrite = new CloudFrontFunction(this, 'SpaRewrite', {
      code: FunctionCode.fromInline(SPA_REWRITE),
      runtime: FunctionRuntime.JS_2_0,
    });

    const distribution = new Distribution(this, 'Distribution', {
      comment: 'SpinDesk',
      defaultRootObject: 'index.html',
      httpVersion: HttpVersion.HTTP2_AND_3,
      priceClass: PriceClass.PRICE_CLASS_200,
      enableLogging: true,
      logBucket: logsBucket,
      logFilePrefix: 'cloudfront/',
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessControl(siteBucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: CachePolicy.CACHING_OPTIMIZED,
        responseHeadersPolicy: securityHeaders,
        functionAssociations: [
          { function: spaRewrite, eventType: FunctionEventType.VIEWER_REQUEST },
        ],
      },
      additionalBehaviors: {
        '/api/*': {
          origin: new HttpOrigin(apiDomain, { protocolPolicy: OriginProtocolPolicy.HTTPS_ONLY }),
          viewerProtocolPolicy: ViewerProtocolPolicy.HTTPS_ONLY,
          allowedMethods: AllowedMethods.ALLOW_ALL,
          cachePolicy: CachePolicy.CACHING_DISABLED,
          originRequestPolicy: OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
          responseHeadersPolicy: securityHeaders,
        },
      },
    });

    Validations.of(distribution).acknowledge(
      {
        id: 'AwsSolutions-CFR1',
        reason:
          'No geo restriction: staff may sign in while travelling. Access is limited by company login.',
      },
      {
        id: 'AwsSolutions-CFR4',
        reason:
          'Default *.cloudfront.net certificate (no custom domain), so the TLS policy cannot be set.',
      },
      {
        id: 'AwsSolutions-CFR2',
        reason:
          'WAF omitted to keep costs near zero (20 internal users, 25 days). Compensating controls: Cognito login on every data route and API Gateway throttling.',
      },
    );

    if (siteAssetPath) {
      const deployment = new BucketDeployment(this, 'DeploySite', {
        sources: [
          Source.asset(siteAssetPath),
          // Public, non-secret runtime settings read by the SPA at startup.
          Source.jsonData('config.json', { region: REGION, apiBaseUrl: '/api/v1' }),
        ],
        destinationBucket: siteBucket,
        distribution,
        distributionPaths: ['/*'],
        prune: true,
      });
      this.acknowledgeDeploymentHandler(deployment, siteBucket);
    }

    new CfnOutput(this, 'SiteUrl', { value: `https://${distribution.distributionDomainName}` });
  }

  /**
   * The deployment Lambda is created and permissioned by aws-cdk-lib and runs only during
   * deploys. Each finding is acknowledged by name on that handler alone, so nothing in our
   * own resources is suppressed.
   */
  private acknowledgeDeploymentHandler(deployment: BucketDeployment, siteBucket: Bucket) {
    const handler = deployment.handlerRole.node.scope;
    if (!handler) return;
    const stack = Stack.of(this);
    const siteBucketId = stack.getLogicalId(siteBucket.node.defaultChild as CfnBucket);
    const assetBucket = `arn:aws:s3:::cdk-hnb659fds-assets-${stack.account}-${stack.region}/*`;
    const reason =
      'CDK-managed BucketDeployment handler (deploy-time only); its runtime and permissions are set by aws-cdk-lib.';
    const findings = [
      'AwsSolutions-L1',
      'AwsSolutions-IAM4[Policy::arn:<AWS::Partition>:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole]',
      ...['s3:GetBucket*', 's3:GetObject*', 's3:List*', 's3:Abort*', 's3:DeleteObject*'].map(
        (action) => `AwsSolutions-IAM5[Action::${action}]`,
      ),
      `AwsSolutions-IAM5[Resource::${assetBucket}]`,
      `AwsSolutions-IAM5[Resource::<${siteBucketId}.Arn>/*]`,
      'AwsSolutions-IAM5[Resource::*]',
    ];
    Validations.of(handler).acknowledge(...findings.map((id) => ({ id, reason })));
  }
}
