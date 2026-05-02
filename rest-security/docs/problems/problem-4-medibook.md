# Practice Problem 4 — MediBook (Healthcare Appointment System)

## Key Issues
- IDOR/BOLA on medical record URLs.
- Unescaped HTML in notes.
- Mongo injection in search.
- Sessions lasting days.
- Weak validation for contact info and dates.
- Unsafe uploads.

## Strategy
- Strict RBAC + per-record access checks + audit logging.
- Sanitization for notes with medical terminology preserved.
- Operator injection protection + strict query building.
- Healthcare-appropriate session timeouts.
- Strong validation for DOB/appointment dates.
- Encrypted storage for documents + access logs.
