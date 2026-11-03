# SpinDesk: Table Tennis Tournament 2026 Roadmap

| | |
|---|---|
| **Status** | Approved plan. Phase 0.2–0.5 built (code complete, not yet deployed); 0.1 governance actions open |
| **Last updated** | 2026-10-29 |
| **Source requirements** | [proposal.md](proposal.md), [task.md](task.md), [color-combinations.md](color-combinations.md) |
| **Related docs** | [COST_ESTIMATE.md](COST_ESTIMATE.md), [docs/ISO-COMPLIANCE.md](docs/ISO-COMPLIANCE.md), [docs/RULES-2026-DRAFT.md](docs/RULES-2026-DRAFT.md) |

> 🚨 **ISO actions are open.** Two items need action before any build work goes live: the 2025 site exposes employee contact data, and the repo sits under a personal account. See [docs/ISO-COMPLIANCE.md](docs/ISO-COMPLIANCE.md) §1.

---

## 1. Goal

A mobile-friendly web app that runs the Craftsmen annual table tennis tournament for about 20 players (it handles up to 100). It covers registration, the random draw, fixtures, live scoring, standings, knockouts, the reschedule policy and feedback. It runs on AWS for at most 25 days.

## 2. Decisions

| # | Topic | Decision |
|---|---|---|
| D1 | Tech stack | React 19 + Vite + TypeScript (web); AWS serverless in TypeScript (API, infra) |
| D2 | Login | Email + password on Amazon Cognito. Sign-up is limited to `@craftsmensoftware.com` and requires email verification |
| D3 | Public access | Without login, visitors see **Home, Rules and Privacy only**. Every page showing employee names, photos or teams requires login |
| D4 | Reschedule | **One reschedule per match in total.** Either side may request it; an admin approves it and sets the new slot. No further reschedules are possible after that. Not playing at the new slot means a walkover |
| D5 | Hosting | Private S3 bucket behind CloudFront (HTTPS on `*.cloudfront.net`). No custom domain |
| D6 | Region and stacks | One CloudFormation stack in `ap-south-1` (Mumbai), the closest region to Dhaka. No cloud `dev` environment: development and testing run locally and in CI |
| D7 | Live updates | Polling (15 s while a live match is on screen), not WebSockets |
| D8 | Roles | Player (default) · Scorer · Admin. Admin is the proposal's "super admin" |
| D9 | Timeline | Registration opens in **~4 weeks** (target end of week 4). The stack goes live then and is torn down by **day 25** |
| D10 | Cost | No paid extras: no WAF, no KMS keys, no dashboards or secrets. Expected AWS cost for the whole run is **≈ $0.20–1** ([COST_ESTIMATE.md](COST_ESTIMATE.md)) |

## 3. Open decisions

| # | Decision needed | Owner | Needed by | Default if undecided |
|---|---|---|---|---|
| O1 | **Email delivery** (on hold). Options: (a) IT adds DKIM DNS records so SES can send from a company subdomain, e.g. `tt.craftsmensoftware.com` (recommended); (b) a company-owned mailbox. A personal Gmail account is **not allowed** (ISO). | Project owner + IT | Before R1 go-live (end of week 4) | Cognito's default sender for sign-up codes. It is capped at **50 emails/day** and some mail may land in spam. All other notifications are in-app only |
| O2 | Office-team list for the profile dropdown | Organising committee | Week 3 | Admin-editable list, starting empty |
| O3 | Best-of per round; plate bracket; 3rd-place match | Committee | Before the draw (Phase 2) | Bo3 everywhere, plate off, no 3rd-place match (all configurable) |
| O4 | Final rules wording | Committee | Before R1 | [docs/RULES-2026-DRAFT.md](docs/RULES-2026-DRAFT.md) is published as v1 |
| O5 | Registration close date and group-stage start date | Committee | Week 3 | Admin sets them in settings |
| O6 | ISMS acceptance of the cost decisions: one cloud environment and no WAF ([ISO-COMPLIANCE §2.12, §2.16](docs/ISO-COMPLIANCE.md)) | Project owner + ISMS | Before R1 | Proceed as designed; if the ISMS requires them, add a `dev` stack (< $1) or WAF (≈ $7.50) |

## 4. Releases

| Release | Target | Users can… |
|---|---|---|
| **R1, registration open** | End of week 4 | Sign up with a company email, verify, log in, complete their profile, register for the tournament, read the rules and send feedback. Admins can manage users and roles |
| **R2, group stage** | ~Week 5–6, i.e. ~day 7–10 of the live stack (depends on O5) | See the published draw (groups, doubles teams), fixtures, today's and my matches, live scores and standings. Scorers can score. Players can request their one reschedule |
| **R3, knockouts** | ~Week 6–7, before the group stage ends | Knockout brackets fill in automatically; next rounds are auto-scheduled; champions are shown |
| **Close-out** | By day 25 of the live stack | Results archived, personal data deleted, infrastructure torn down |

---

## 5. Phases

Each sub-phase ends with a reviewed PR. Exit criteria must be met before the next release.

### Phase 0: Foundations (week 1)

| Sub-phase | Scope | Exit criteria |
|---|---|---|
| **0.1 Governance** (owner: project owner / ISMS) | Report the 2025 site exposure; transfer the repo to a company GitHub org; arrange company AWS account access (IAM Identity Center); add the system to the asset register; start the privacy-notice approval | Items in [ISO-COMPLIANCE §1](docs/ISO-COMPLIANCE.md#1-loud-findings-action-required) acknowledged |
| **0.2 Monorepo scaffold** | npm workspaces (`apps/web`, `services/api`, `packages/shared`, `infra`); strict TypeScript; ESLint + Prettier; Vitest; `.nvmrc`; PR template with an ISO checklist | `npm run lint`, `typecheck` and `test` pass |
| **0.3 Design system** | Tailwind tokens from the palette; UI kit (Button, Card, StatusBadge, ResponsiveTable, Tabs, Dialog, Avatar, form fields); AppShell with a mobile bottom nav and desktop sidebar; route skeleton | Renders without horizontal scroll at 360/768/1280 px; badges meet WCAG AA |
| **0.4 Infrastructure skeleton** | One CDK stack: data (DynamoDB app + audit tables, media bucket), web (private S3 + CloudFront OAC + security headers), API (HTTP API + health Lambda); cdk-nag; budget alert | `cdk synth` clean with cdk-nag; first deploy once company AWS access is ready |
| **0.5 CI** | GitHub Actions: lint, typecheck, test, `npm audit`, gitleaks secret scan, `cdk synth` | Green on the PR |

### Phase 1: Accounts & registration (weeks 2–4) → **R1**

| Sub-phase | Scope | Exit criteria |
|---|---|---|
| **1.1 Authentication** | Cognito user pool; pre-sign-up domain check; post-confirmation profile creation; sign-up / verify / login / forgot-password pages; protected routes with redirect back after login (e.g. Today → My matches) | A non-company email is rejected server-side; an unverified user can't log in |
| **1.2 Users, roles, audit** | User model; role middleware (roles read from the DB on each request, so revocation is immediate); admin users page (search, change role, disable, withdraw); TOTP MFA required before granting Scorer/Admin; append-only audit log; one-time bootstrap script for the first admin | Authorization test suite: Player can't call Scorer/Admin APIs and Scorer can't call Admin APIs |
| **1.3 Profile & registration** | `/me` profile page; avatar upload (resized in the browser, presigned upload, ≤1 MB); initials avatar fallback; tournament registration form (playing category, office team, optional mobile with "share with opponents" toggle, rules and privacy consent); registration window from settings | Men are enrolled in Singles + Doubles, women in Singles; registration closes automatically at the deadline |
| **1.4 Content** | Home (public and logged-in variants); Rules page (markdown, versioned, admin editor with publish; seeded from the draft rules); Privacy notice page | Rules history shows author, version and date |
| **1.5 Feedback** | Feedback form (category, message, optional anonymous mode that stores **no** user id); rate limit; admin triage (New / In review / Resolved) | Anonymous feedback has no user link in the DB |
| **1.6 R1 hardening** | CSP/header check; CloudFront origin-verify header so the API is only reachable through CloudFront; mobile QA; accessibility pass; first deploy (test with fictional data only, wiped before go-live); ISMS sign-off on the privacy notice | R1 go/no-go checklist signed |

### Phase 2: Tournament engine & draw (weeks 2–5, overlaps Phase 1)

| Sub-phase | Scope | Exit criteria |
|---|---|---|
| **2.1 Engine** (pure TypeScript in `packages/shared`) | Seeded, auditable random draw; balanced group draw (sizes differ by ≤1, min 3); doubles team lottery (odd player flagged to admin); round-robin order; game/match score validation (11 points, win by 2, best-of per round); standings with tiebreaks; knockout bracket (byes, same-group separation); advancement; walkovers; withdrawals | Property-based tests for every player count from 2 to 100 |
| **2.2 Event configuration** | Admin UI per event (Men's Singles, Men's Doubles, Women's Singles): format (groups + knockout / round robin + final / knockout only), group size, qualifiers per group, best-of per round, plate toggle | Configs validated; women's event suggests "round robin + final" when there are ≤6 players |
| **2.3 Draw ceremony** | Admin previews the draw, publishes it, and can reset and redraw (free before any score; after that, forced with typed confirmation); published Groups and Teams pages; the draw seed is stored in the audit log | Any draw can be reproduced from its seed |

### Phase 3: Fixtures, scheduling & scoring (weeks 4–6) → **R2**

| Sub-phase | Scope | Exit criteria |
|---|---|---|
| **3.1 Scheduler** | Admin defines time slots (date × time × tables); auto-scheduler with no double-booking across events, rest gaps and a per-day cap; manual edits; publish | No player is double-booked in any generated schedule |
| **3.2 Fixtures & today** | Fixtures per event (groups, list, by date); Today's matches with a "My matches" tab; match detail page | Usable one-handed at 360 px |
| **3.3 Scorer console** | Point-by-point +1/−1 with undo; large score readout; game/match validation; final confirmation; concurrent-edit protection; score corrections allowed until the next round starts (admin only after that) | Two scorers editing the same match can't overwrite each other |
| **3.4 Standings** | Live group tables with tiebreak explanations | Matches the engine's results |
| **3.5 Reschedule & walkover** | Player requests a reschedule (once per match, with a reason); admin approves and picks a slot (the scheduler suggests options); admin records walkovers | A second request is blocked by both the API and the UI |

### Phase 4: Knockouts & automation (weeks 5–7, shipped while the group stage runs) → **R3**

| Sub-phase | Scope | Exit criteria |
|---|---|---|
| **4.1 Knockout generation** | Group stage closes → knockout preview → publish (or automatic); winners advance automatically; byes advance automatically; next-round matches are auto-scheduled | A full simulated tournament runs end to end in tests |
| **4.2 Bracket & champions** | Responsive bracket (horizontal scroll inside its own container, round tabs on mobile); champions shown on Home | Readable at 360 px |
| **4.3 Optional brackets** | Plate bracket for 3rd-place group finishers; 3rd-place match (both toggles) | Off by default |
| **4.4 Admin dashboard** | Live matches, pending reschedules, overdue matches, new feedback | — |

### Phase 5: Notifications (email part blocked by O1)

| Sub-phase | Scope |
|---|---|
| **5.1 In-app notifications** | Bell icon: draw published, match scheduled or rescheduled, reschedule decision |
| **5.2 Email** | Channel chosen in O1; templates; daily "today's matches" digest via EventBridge Scheduler. Emails contain **no** phone numbers unless the opponent opted in |

### Phase 6: QA & security (continuous; gates R1 and R2)

- Playwright end-to-end tests at 360 / 390 / 768 / 1280 px
- Authorization/escalation test suite; OWASP ASVS Level 1 checklist; dependency audit
- Runbooks: deploy, rollback, incident, admin guide, scorer guide

### Phase 7: Close-out (by day 25)

- Export a results archive (champions, brackets, standings) with no contact data
- Delete personal data: profiles, avatars, mobile numbers, feedback, the Cognito user pool
- `cdk destroy`; remove any DNS records added for email
- Send deletion evidence to the ISMS (A.8.10)

---

## 6. Traceability (proposal → roadmap)

| Proposal requirement | Where |
|---|---|
| React + TypeScript frontend, AWS backend | 0.2, 0.4 |
| Player role: read-only fixtures, points table, rules | 1.2, 3.2, 3.4, 1.4 |
| Scorer role: write/modify scores only | 1.2, 3.3 |
| Admin / super admin: all permissions (roles, eliminate user, match CRUD, policy) | 1.2, 2.3, 3.1, 3.5, 1.4 |
| Home page | 1.4 |
| Login with `@craftsmensoftware.com` only | 1.1 |
| Register | 1.1, 1.3 |
| Policy / rules page; rules adapted from 2025 | 1.4, [RULES-2026-DRAFT](docs/RULES-2026-DRAFT.md) |
| Fixture page | 3.2 |
| Point table | 3.4 |
| User portal | 1.3 |
| Today's matches + "My matches" (redirects to login) | 1.1, 3.2 |
| Feedback to the organisers | 1.5 |
| User properties: name, unique ID, team, mobile (optional), email, photo (optional, else avatar), role, male/female | 1.3 (male/female is collected as **playing category** only) |
| Events: Men's Singles, Men's Doubles, Women's Singles | 2.2 |
| Men play both Singles and Doubles; women Singles | 1.3 |
| Random groups → group round → QF / SF / F | 2.1, 2.3, 4.1 |
| Random doubles lottery, published | 2.1, 2.3 |
| Admin can reset and recreate groups and teams | 2.3 |
| One reschedule per match, strictly enforced | 3.5 |
| Emails if not costly | 5.2 (blocked by O1) |
| Tournament-time hosting, no domain | 0.4, 7 |
| Sorting, elimination, automatic next-round scheduling | 2.1, 3.1, 4.1 |
| Mobile-friendly (task.md) | 0.3, 6 |
| Palette from color-combinations.md (task.md) | 0.3 |
| Cost document (task.md) | [COST_ESTIMATE.md](COST_ESTIMATE.md) |
| Flag ISO risks loudly (task.md) | [docs/ISO-COMPLIANCE.md](docs/ISO-COMPLIANCE.md) |

## 7. Technical approach (summary)

```
Browser (React SPA)
   │  HTTPS  https://<id>.cloudfront.net
   ▼
CloudFront (HTTPS, security headers) ──► S3 (private, OAC): SPA files + config.json
   │ /api/*
   ▼
API Gateway HTTP API (Cognito JWT authorizer, throttling)
   ▼
Lambda (Hono, TypeScript) ──► DynamoDB AppTable (PITR)
   │                      ──► DynamoDB AuditTable (append-only)
   │                      ──► S3 media bucket (avatars, presigned URLs)
Cognito User Pool ◄── pre-sign-up (domain check) / post-confirmation (create profile)
```

| Area | Choice |
|---|---|
| Web | React 19, Vite, React Router, TanStack Query, Tailwind CSS v4, react-hook-form + zod, Amplify Auth (Cognito only), react-markdown (no raw HTML) |
| API | Hono on Lambda, zod validation, DynamoDB optimistic locking, transactional writes for result + advancement + audit |
| Engine | Pure functions in `packages/shared/src/engine` (draw, round robin, scoring, standings, bracket, advancement, scheduler) |
| Infra | AWS CDK (TypeScript), one stack in `ap-south-1`, cdk-nag on every synth |
| CI/CD | GitHub Actions runs all checks; deploys are manual (`cdk deploy` after `cdk diff` review), outside match hours |

### Roles

| Capability | Public | Player | Scorer | Admin |
|---|:-:|:-:|:-:|:-:|
| Home, Rules, Privacy | ✓ | ✓ | ✓ | ✓ |
| Fixtures, standings, brackets, today's matches, match details | | ✓ | ✓ | ✓ |
| Own profile, registration, my matches, reschedule request, feedback | | ✓ | ✓ | ✓ |
| Start match, enter or correct scores | | | ✓ | ✓ |
| Users and roles, draw/reset, knockouts, schedule, reschedule approval, walkovers, rules, feedback triage, settings, audit log | | | | ✓ |

## 8. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Email decision (O1) not made by R1 | Verification codes capped at 50/day; possible spam folder | Spread registration over several days; admins can resend codes; decide O1 by week 3 |
| Registration count unknown until close | Draw sizes vary | The engine handles 2–100 entries; admin previews before publishing |
| Score disputes | Wrong results propagate into the knockouts | Every change is audited with before/after values; corrections are locked once the next round starts (admin override is audited) |
| Company AWS account access late | No deploy for R1 | Local development and `cdk synth` continue; request access in week 1 |
| 25-day live window compresses Phases 3–4 | Knockouts must ship while the group stage is running | Build the engine (Phase 2) early with full tests; knockout UI is the only part that can lag. With ~20 players, registration can close within a week |
| No cloud test environment | A bad deploy reaches users directly | Automated tests and cdk-nag in CI, `cdk diff` review, deploy outside match hours, DynamoDB point-in-time recovery |
| ISO sign-offs late | R1 blocked | Start 0.1 in week 1 |
