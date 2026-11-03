# SpinDesk: Cost Estimate

| | |
|---|---|
| **Prepared** | 2026-10-29 (revised for ~20 users, 25 days, one stack) |
| **Scope** | Everything AWS bills from deploy to teardown |
| **Region** | `ap-south-1` (Mumbai), one CloudFormation stack, no cloud dev environment |
| **Currency** | USD, excluding any local taxes (e.g. VAT) on the AWS invoice |

## Bottom line

| | Whole 25-day run |
|---|---:|
| **Typical** | **≈ $0.20** |
| **High** (3× the expected traffic, emails switched on) | **≈ $1** |
| **Non-AWS costs** | **$0** |

At 20 users almost everything stays inside AWS's permanent free tiers. The few paid items (API calls, database reads, log storage) come to cents. Most line items will show as $0.00 on the invoice.

## What was removed to keep it this low

| Removed | Would have cost (25 days) | What protects us instead |
|---|---:|---|
| **AWS WAF** (and its separate us-east-1 stack) | ≈ $7.50 | Company login (Cognito) on every page and API route that shows data; API Gateway throttling (50 requests/s); CloudFront HTTPS and security headers |
| **KMS** customer- or AWS-managed keys | ≈ $0.05–2 | Data is still encrypted at rest, using DynamoDB-owned keys and S3-managed keys (SSE-S3), both free |
| **Separate `dev` environment** | ≈ the same again as prod | Local development plus automated tests and `cdk diff` review before each deploy |
| CloudWatch dashboard, Secrets Manager, Cognito *Plus* tier, Route 53 / domain | ≈ $5 | Not needed for this size |

## Usage assumptions

| Item | Assumption |
|---|---|
| Users | ~20 registered, ~15 active on a given day |
| Lifetime | Stack deployed when registration opens, torn down by **day 25** |
| Matches | ~50 in total (Men's Singles + Doubles, Women's Singles) |
| API calls | Browsing ≈ 700/day plus live-score polling (every 15 s while a match is on) ≈ 2,200/day → **≈ 75,000 in total**. High case ≈ 250,000 |
| Data stored | < 50 MB (database, ~20 avatars of ≤ 50 KB, site files, access logs) |
| Emails | Sign-up codes through Cognito's free default sender. Notification emails are on hold (roadmap O1). If switched on: ≈ 600–1,000 |

## Per-service estimate (whole 25 days)

| Service | What it's for | Typical | High | Why |
|---|---|---:|---:|---|
| **CloudFront** (+ CloudFront Function) | HTTPS website and API front door | $0 | $0 | Always-free tier: 1 TB transfer, 10 M requests and 2 M function runs per month |
| **API Gateway** (HTTP API) | Backend API | $0.08 | $0.25 | $1.00 per million requests ($0 if the account is under 12 months old) |
| **Lambda** | Backend code | $0 | $0 | Always-free tier: 1 M requests and 400,000 GB-seconds per month |
| **DynamoDB** (on-demand, with point-in-time backup) | Database and audit log | $0.09 | $0.35 | $0.125 per M reads, $0.625 per M writes; 25 GB storage free; backup ≈ $0.001 |
| **S3** (site, avatars, logs) | Files and access logs | $0.02 | $0.10 | A few MB of storage; log-file and origin requests |
| **CloudWatch Logs** | API and Lambda logs (30-day retention) | $0 | $0.05 | 5 GB/month ingestion free; we expect < 0.1 GB |
| **Cognito** | Login | $0 | $0 | Free up to 10,000 monthly users for email + password sign-in |
| **Email** | Sign-up codes; optional notifications | $0 | $0.16 | Cognito default sender is free. SES *Essentials* (if chosen) is $0.16 per 1,000 emails, no fixed fee |
| **CDK bootstrap** (one region) | Deployment staging bucket | $0.01 | $0.05 | A few MB of deployment files |
| **AWS Budgets, CloudTrail** | Cost alert, AWS audit trail | $0 | $0 | Free |
| **Total** | | **≈ $0.20** | **≈ $1** | |

Mumbai prices can be up to ~10–15% above the us-east-1 list prices used here. At these amounts that's less than a cent.

## Optional add-ons (not included above)

| Add-on | Cost for 25 days | When it would make sense |
|---|---:|---|
| AWS WAF (pay-as-you-go: $5/web ACL + $1/rule group per month, prorated, + $0.60/M requests) | ≈ $7.50 | If the ISMS requires a web firewall. It also brings back a second (us-east-1) stack |
| Company subdomain with an ACM certificate | $0 (ACM is free; company DNS) | Removes the TLS residual risk ([ISO-COMPLIANCE §2.22](docs/ISO-COMPLIANCE.md)); needs IT to add DNS records |
| SES email notifications | ≈ $0.10–0.16 | Once roadmap decision O1 is made |
| A separate `dev` environment | ≈ $0.20–1 more | Only if the ISMS requires a cloud test environment ([ISO-COMPLIANCE §2.12](docs/ISO-COMPLIANCE.md)) |

## Cost guardrails

1. **AWS Budgets alert** emails the account owner at **$2** and **$5**. That's 2–5× the high estimate, so any alert means something unexpected is running. It's included in the stack when deployed with `-c alertEmail=…`.
2. **API Gateway throttling** (50 requests/s, burst 100) caps runaway clients or scripts.
3. **No always-on servers.** Lambda and on-demand DynamoDB cost $0 when idle.
4. **Teardown by day 25** (roadmap Phase 7). The database tables and buckets are set to *retain* so an accidental delete can't lose tournament data. They must be emptied and deleted as part of close-out, which the ISO data-deletion rule requires anyway. Left behind, they would cost about $0.01/month.

## Compared with the first estimate

| | First estimate | This estimate |
|---|---|---|
| Users / lifetime | 100 users, ~3 months | ~20 users, 25 days |
| Environments | `dev` + `prod`, 4 stacks in 2 regions | 1 stack in 1 region |
| Paid extras | WAF, KMS keys, dashboard, Cognito Plus (in the maximum) | None |
| Total | ≈ $5–100 | **≈ $0.20–1** |

## Sources (checked 2026-10-29)

- [API Gateway pricing](https://aws.amazon.com/api-gateway/pricing/): HTTP API $1.00/M; 1 M free per month for new accounts (12 months)
- [DynamoDB on-demand pricing](https://aws.amazon.com/dynamodb/pricing/on-demand/): $0.625/M writes, $0.125/M reads, 25 GB free, PITR $0.20/GB-month
- [Amazon Cognito pricing](https://aws.amazon.com/cognito/pricing/): 10,000 MAU free for direct sign-in
- [Amazon SES pricing](https://aws.amazon.com/ses/pricing/): Essentials $0.16/1k, no fixed fee
- [AWS WAF pricing](https://aws.amazon.com/waf/pricing/): $5 per web ACL, $1 per rule group, $0.60/M requests (optional add-on only)
- CloudFront, Lambda and CloudWatch Logs always-free tiers: [AWS Free Tier](https://aws.amazon.com/free/)
