# Additional Practice Problems — Security Scenarios

This folder contains:
- Per-problem writeups: `docs/problems/*`
- Generic production security checklist: `docs/security-checklist.md`

A runnable reference Express + MongoDB API implementation lives in `src/` with tests in `tests/`.

## Run
1. `npm install`
2. Create `.env`:
   - `MONGODB_URI=mongodb://localhost:27017/security_scenarios`
   - `SESSION_SECRET=change-me`
3. `npm run dev`

## Test
- `npm test`
