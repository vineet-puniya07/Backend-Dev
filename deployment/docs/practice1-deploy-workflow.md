# Practice 1 — Deployment Workflow & Controls

## Environments

- **Development** (Heroku): free deploys
- **Staging** (Heroku): requires code review approval
- **Production** (IIS): requires QA sign-off + maintenance window

## Approvals

- Staging deployments require an `ApprovalId` passed to the script:
  - `./scripts/deploy-staging.ps1 -HerokuApp <app> -ApprovalId CR-12345`

- Production deployments require a `QaSignoffId`:
  - `./scripts/deploy-prod-iis.ps1 -DeployRoot "D:\\apps\\tx-system" -QaSignoffId QA-9876`

## Maintenance Window Enforcement

- Production script enforces: **weekends 02:00–06:00** local time.
- For practice runs only, you can override via `-Force`.

## Audit Logs

- All deployment scripts append to `audit/deployments.log`.

## Environment Isolation

- Each environment must use a distinct MongoDB Atlas cluster (recommended) or at minimum:
  - separate Atlas projects
  - separate clusters
  - separate DB users
  - separate database names

Configuration is done via `MONGODB_URI` and `MONGODB_DB`.
