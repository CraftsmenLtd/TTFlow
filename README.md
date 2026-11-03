# pingPong (SpinDesk)

Table tennis tournament organising platform for the Craftsmen annual program, 2026.

- **Plan:** [ROADMAP.md](ROADMAP.md)
- **Costs:** [COST_ESTIMATE.md](COST_ESTIMATE.md)
- **ISO compliance notes (read first):** [docs/ISO-COMPLIANCE.md](docs/ISO-COMPLIANCE.md)
- **Draft rules for committee review:** [docs/RULES-2026-DRAFT.md](docs/RULES-2026-DRAFT.md)
- **Requirements:** [proposal.md](proposal.md), [task.md](task.md), [color-combinations.md](color-combinations.md)

## Repository layout

| Path | What |
|---|---|
| `apps/web` | React 19 + Vite + Tailwind CSS v4 single-page app (mobile-first) |
| `services/api` | Hono API that runs on AWS Lambda |
| `packages/shared` | Code shared by web and API: email-domain rule, roles and permissions, match statuses (and later the tournament engine) |
| `infra` | AWS CDK app: one `SpinDesk` stack in ap-south-1 (data, API, web), checked by cdk-nag |

## Getting started

Requires Node 24 (`nvm use`) and npm 11.

```sh
npm ci
npm run dev          # web app on http://localhost:5173 (UI kit at /design in dev only)
```

| Command | What it does |
|---|---|
| `npm run lint` | ESLint across all workspaces |
| `npm run format:check` | Prettier check |
| `npm run typecheck` | TypeScript in every workspace |
| `npm test` | Vitest in every workspace (infra tests synthesize the stacks and run cdk-nag) |
| `npm run build` | Production build of the web app (`apps/web/dist`) |
| `npm run synth -w infra -- -c account=111111111111` | Synthesize CloudFormation with a placeholder account (no AWS access needed) |

## Deploying

Not deployed yet. Deploys go **only** to the company AWS account (see [ISO-COMPLIANCE §2.1](docs/ISO-COMPLIANCE.md#2-other-requirements-designed-in)):

```sh
aws sso login --profile <company-profile>
npm run build
npm run diff -w infra -- --profile <company-profile>     # review changes first
npm run deploy -w infra -- --profile <company-profile> -c alertEmail=<owner>@craftsmensoftware.com
```

`cdk bootstrap aws://<account>/ap-south-1` is needed once. There is no separate dev environment: test locally, and deploy outside match hours.

## Notes

- TypeScript is pinned to 6.0.x because typescript-eslint doesn't support TypeScript 7 yet.
- npm install scripts are left blocked (`npm install-scripts ls`); esbuild works without its postinstall step.
