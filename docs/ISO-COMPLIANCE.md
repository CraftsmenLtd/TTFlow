# SpinDesk: ISO Compliance Notes

| | |
|---|---|
| **Prepared** | 2026-10-29 |
| **Applies to** | The tournament app in this repo and the infrastructure it deploys |
| **Standard referenced** | ISO/IEC 27001:2022 Annex A (control numbers below). ISO 9001 is referenced where relevant |
| **Status** | Draft for the ISMS / Information Security officer to review. These are engineering notes, not a formal risk assessment |

---

## 1. 🚨 Loud findings: action required

### 1.1 🚨 LIVE: last year's site exposes employee contact data
- **What:** `https://tt-tournament-2025.netlify.app/player_contacts.txt` is publicly reachable (checked 2026-10-29: `HTTP 200`, `text/plain`, 1,323 bytes). The site's own code parses this file as **name, email and phone** per player and puts opponents' contact details into emails. The file contents were **not** downloaded during this check.
- **Also public on that site:** `groups.txt`, `teams.txt` and `womens-groups.txt` (employee names), a Google API key and OAuth client ID in the JavaScript bundle, and published source maps.
- **Controls:** A.5.34 (privacy and protection of PII), A.8.12 (data leakage prevention), A.5.24–A.5.26 (incident management).
- **Action (owner: project owner → ISMS):**
  1. Report it through the company incident procedure.
  2. Remove the file (or the whole site) and rotate or restrict the Google API key.
  3. Record the outcome.

### 1.2 🚨 Repository is under a personal GitHub account
- **What:** `origin` = `craftsmen-sadekur/pingPong`. The repo is private but owned by a GitHub **User** account, not a company organization.
- **Controls:** A.5.9 (inventory of assets), A.5.18 (access rights), A.5.11 (return of assets).
- **Action:** transfer it to the company GitHub organization, enable branch protection on `main` (PR review, status checks) and add it to the asset register.

### 1.3 🚨 "Host on S3" directly would be HTTP only
- **What:** S3 static website endpoints don't support HTTPS. Passwords and login tokens would cross the network in plain text.
- **Controls:** A.8.24 (use of cryptography), A.8.20 (network security).
- **Resolution (designed in):** a private S3 bucket (Block Public Access) behind **CloudFront with Origin Access Control**, HTTPS only (HTTP redirects to HTTPS), HSTS. No domain needed.

### 1.4 🚨 Personal Gmail for sending email is not allowed
- **What:** It was proposed to send tournament mail from a personal Gmail account.
- **Why not:**
  - Employee data would sit in a mailbox the company doesn't control (A.5.10, A.5.14).
  - It would bring in an unassessed consumer service (A.5.19–A.5.23).
  - A personal credential would be stored in a company system (A.5.17, A.8.5).
- **Status:** email is **on hold** (roadmap O1). The compliant options are SES with DKIM on a company subdomain (recommended) or a company-owned mailbox.

---

## 2. Other requirements (designed in)

| # | Requirement | Control(s) | How the design meets it |
|---|---|---|---|
| 2.1 | Use a **company-owned AWS account** only | A.5.23 | Deploy only to a company account with IAM Identity Center, MFA on root, CloudTrail on, budgets on. **Never** a personal or free-tier personal account |
| 2.2 | Restrict access to employees | A.5.15, A.8.5 | Sign-up only for `@craftsmensoftware.com` (checked server-side in a Cognito trigger); email must be verified before login |
| 2.3 | Least-privilege roles | A.5.15, A.8.2 | Player / Scorer / Admin with a permission matrix enforced by the API; roles read from the DB on every request (immediate revocation); only an admin can grant roles |
| 2.4 | Stronger authentication for privileged users | A.8.5 | TOTP MFA required before the Scorer or Admin role can be granted |
| 2.5 | Don't publish employee data | A.5.34, A.8.3 | Without login, visitors see only Home, Rules and Privacy. Fixtures, standings, names and photos require login |
| 2.6 | Data minimisation | A.5.34 | "Playing category: Men's/Women's" instead of a general gender field; mobile number optional, visible to admins only unless the user opts in to share it with opponents; no employee ID collected (system-generated ID instead) |
| 2.7 | No third-party data leaks from the UI | A.5.34, A.8.12 | Default avatars are drawn locally (initials), with no Gravatar or ui-avatars; no third-party analytics or fonts CDN loading at runtime unless approved |
| 2.8 | Encryption in transit and at rest | A.8.24 | HTTPS everywhere; DynamoDB and S3 encrypted at rest with AWS-owned keys (DynamoDB-owned, SSE-S3). No KMS keys, to keep cost at zero; encryption at rest is unchanged |
| 2.9 | Integrity of results and audit trail | A.8.15, A.8.16 | Append-only audit table (the Lambda role can only `PutItem`) recording who, what, when, before and after for every scorer/admin write; the draw's random seed is stored, so any draw can be reproduced |
| 2.10 | Secure development | A.8.25–A.8.29 | PR review; CI runs lint, type checks, tests, `npm audit` and gitleaks secret scanning; cdk-nag checks the infrastructure; validation (zod) on every API input; Markdown rendered **without** raw HTML (prevents XSS) |
| 2.11 | No secrets in code | A.5.17, A.8.4 | No keys in the repo; GitHub → AWS through OIDC (no long-lived AWS keys); runtime config contains only public IDs |
| 2.12 | ⚠️ **Single cloud environment (cost decision, 2026-10-29)** | A.8.31, A.8.33 | Only production runs in AWS. Development and testing happen on developer machines and in CI (unit tests plus a full infrastructure synth with cdk-nag), and every infrastructure change is reviewed with `cdk diff` in its PR. Deploys happen outside match hours. Any testing in the live stack uses **fictional** accounts and data only, deleted before registration opens. **Confirm with the ISMS that local + CI testing satisfies A.8.31**; if not, a `dev` stack costs under $1 extra |
| 2.13 | Change management | A.8.32 | Every change by PR; infrastructure only through CDK (no console changes); DNS changes for email go through an IT change request |
| 2.14 | Logging without PII | A.8.15, A.5.34 | Logs record user IDs, not emails or phone numbers; 30-day CloudWatch log retention |
| 2.15 | Backups | A.8.13 | DynamoDB point-in-time recovery (35 days) |
| 2.16 | Abuse protection (no WAF, cost decision) | A.8.20, A.8.6 | AWS WAF is **not** deployed (it would be ~95% of the AWS bill). Compensating controls: company login on every data route, API Gateway throttling (50 requests/s, burst 100), feedback rate limit, CloudFront HTTPS and security headers. Low risk for a 25-day internal event; **note it in the ISMS risk register** |
| 2.17 | Retention and deletion | A.8.10, A.5.33 | The stack runs for at most 25 days. At close-out the results are archived without contact data, then all personal data is deleted with the stack; deletion evidence kept for the ISMS (roadmap Phase 7) |
| 2.18 | Document control for rules | ISO 9001 7.5 | The rules page is versioned (author, date, version) and published by an admin after committee approval |
| 2.19 | Supplier management | A.5.19–A.5.22 | AWS only (confirm it's an approved supplier). No new third-party services without ISMS review |
| 2.20 | Infrastructure checks as evidence | A.8.9, A.8.27 | Every `cdk synth` runs cdk-nag (AWS Solutions pack) and **fails** on any unacknowledged finding. Each acknowledgment has a written reason, stored in the CloudFormation template metadata (see §2.21) |
| 2.21 | Acknowledged infrastructure findings | A.8.9 | (a) Logs bucket doesn't log to itself; (b) no CloudFront geo restriction (staff travel); (c) TLS policy on the default certificate (see §2.22); (d) the public `/api/v1/health` route has no authorizer; (e) CDK's own site-deployment Lambda (deploy-time only) uses an AWS managed policy, S3 wildcards and a runtime set by aws-cdk-lib; (f) no WAF on CloudFront (see §2.16) |
| 2.22 | ⚠️ **Residual risk: TLS on the default CloudFront certificate** | A.8.24 | Without a custom domain, CloudFront's default `*.cloudfront.net` certificate **can't enforce a minimum TLS version** (old TLS 1.0/1.1 clients can still connect). Modern browsers negotiate TLS 1.2/1.3, so the practical risk is low. The only fix is a company subdomain with an ACM certificate (`TLSv1.2_2021` policy). **Needs ISMS risk acceptance** |
| 2.23 | API only reachable through CloudFront | A.8.20 | The API's own `execute-api` URL is reachable directly, skipping CloudFront's security headers and access logs. Phase 1.6 adds a CloudFront origin-verify header that the API checks |
| 2.24 | Supply-chain hygiene | A.8.8, A.8.30 | npm 11 install scripts stay blocked by default (`npm install-scripts`); Dependabot weekly updates; `npm audit` in CI; AWS CDK CLI telemetry disabled for the project (`cdk.context.json`) |

## 3. Personal data inventory

| Data | Required? | Who can see it | Stored in | Deleted |
|---|---|---|---|---|
| Name | Yes | Logged-in users | DynamoDB, Cognito | Close-out |
| Company email | Yes | Admins; the user | Cognito, DynamoDB | Close-out |
| Office team | Yes | Logged-in users | DynamoDB | Close-out |
| Playing category (Men's/Women's) | Yes, to register | Logged-in users (implied by the event) | DynamoDB | Close-out |
| Mobile | No | Admins; opponents only if the user opts in | DynamoDB | Close-out |
| Profile photo | No | Logged-in users | S3 (private) | Close-out |
| Role, registration status | Yes | Admins; the user | DynamoDB | Close-out |
| Match results | Yes | Logged-in users | DynamoDB | Archived without contact data |
| Feedback | No | Admins (anonymous feedback has no user link) | DynamoDB | Close-out |
| Audit log | Yes | Admins | DynamoDB | Exported to the ISMS archive per company retention policy, then deleted |

## 4. Sign-offs needed before go-live (R1)

- [ ] Incident 1.1 reported and the file removed
- [ ] Repo transferred to the company org (1.2)
- [ ] Company AWS account confirmed (2.1); AWS confirmed as an approved supplier (2.19)
- [ ] Privacy notice text approved (shown at `/privacy` and accepted at registration)
- [ ] Retention and deletion plan approved (2.17)
- [ ] Residual risk accepted: TLS policy on the default CloudFront certificate (2.22), or a company subdomain provided
- [ ] Cost decisions accepted: single cloud environment (2.12) and no WAF (2.16)
- [ ] Email approach decided (roadmap O1), with an IT change request if it's SES + DKIM
- [ ] System added to the asset register / risk register

## 5. PR checklist (copied into the PR template)

- No secrets, keys or personal data in code, tests, fixtures or logs
- New personal-data fields are justified and added to §3
- Every new API route has an authorization check and zod validation
- Admin and scorer write paths write an audit record
- No new third-party service or runtime CDN without ISMS review
