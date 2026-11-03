import { Duration, RemovalPolicy, Validations } from 'aws-cdk-lib';
import { AttributeType, Billing, TableV2 } from 'aws-cdk-lib/aws-dynamodb';
import { BlockPublicAccess, Bucket, BucketEncryption, ObjectOwnership } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class Data extends Construct {
  readonly appTable: TableV2;
  readonly auditTable: TableV2;
  readonly mediaBucket: Bucket;
  readonly logsBucket: Bucket;

  constructor(scope: Construct, id: string) {
    super(scope, id);
    // Tournament data survives an accidental stack delete; the roadmap's Phase 7
    // close-out deletes it on purpose.
    const removalPolicy = RemovalPolicy.RETAIN;

    // Encrypted at rest with DynamoDB-owned keys: no KMS key or KMS request charges.
    const tableDefaults = {
      partitionKey: { name: 'pk', type: AttributeType.STRING },
      sortKey: { name: 'sk', type: AttributeType.STRING },
      billing: Billing.onDemand(),
      pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true },
      deletionProtection: true,
      removalPolicy,
    };

    this.appTable = new TableV2(this, 'AppTable', tableDefaults);
    // Append-only by IAM: the API may only PutItem here (see Api).
    this.auditTable = new TableV2(this, 'AuditTable', tableDefaults);

    // SSE-S3 encryption: free, no KMS.
    const bucketDefaults = {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy,
    };

    // Receives S3 server access logs and CloudFront standard logs (which need ACLs).
    this.logsBucket = new Bucket(this, 'LogsBucket', {
      ...bucketDefaults,
      objectOwnership: ObjectOwnership.BUCKET_OWNER_PREFERRED,
      lifecycleRules: [{ expiration: Duration.days(90) }],
    });
    Validations.of(this.logsBucket).acknowledge({
      id: 'AwsSolutions-S1',
      reason: 'This is the access-log destination bucket; it cannot log to itself.',
    });

    this.mediaBucket = new Bucket(this, 'MediaBucket', {
      ...bucketDefaults,
      serverAccessLogsBucket: this.logsBucket,
      serverAccessLogsPrefix: 'media/',
    });
  }
}
