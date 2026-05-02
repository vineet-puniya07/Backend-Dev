# Practice 2 — Rollback Procedures

## Heroku

- Use Heroku releases rollback:
  - `heroku releases -a <app>`
  - `heroku releases:rollback v123 -a <app>`

## Feature Flag Rollback

- Prefer feature-flag disabling for risky features during peak.
- Keep a runbook entry for each flag.
