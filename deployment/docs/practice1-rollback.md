# Practice 1 — Rollback Procedure (≤5 minutes)

## Heroku (Development/Staging)

- List releases:
  - `heroku releases -a <app>`
- Roll back to a known-good release:
  - `./scripts/rollback-heroku.ps1 -HerokuApp <app> -Release v123`

Expected time: typically < 2 minutes.

## IIS (Production)

This repo uses a **directory swap** layout under `DeployRoot`:

- `current/` — active release
- `previous/` — last release

Rollback script:

- `./scripts/rollback-prod-iis.ps1 -DeployRoot "D:\\apps\\tx-system"`

Expected time: < 1 minute (rename operations).

## Verification

After rollback, verify:

- `GET /healthz` returns 200
- `GET /readyz` returns 200
- `GET /dashboard` loads

## Audit

All deploys/rollbacks append a JSON line to `audit/deployments.log`.
