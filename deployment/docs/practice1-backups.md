# Practice 1 — Production Backups (Daily, 30-day Retention)

## Recommended (MongoDB Atlas Native Backups)

- Use a **production-only** Atlas cluster.
- Enable **continuous backups** (preferred) or scheduled snapshots.
- Configure:
  - daily snapshot
  - retention: 30 days

This satisfies encrypted-at-rest requirements (Atlas encrypts storage by default) and simplifies restore operations.

## Restore Drill (Quarterly)

- Restore a snapshot into a *separate* staging/test cluster.
- Validate application compatibility and data integrity.

## Operational Note

Backups and restores should be performed by approved operators and logged per compliance policy.
