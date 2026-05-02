# Practice Problem 3 — EduLearn (Online Learning Platform)

## Key Issues
- Cross-tenant data leakage between instructors.
- Quiz answer tampering after submission.
- XSS in rich course descriptions.
- Unlimited login attempts.
- Data loss after restarts due to in-memory sessions.
- Unsafe file uploads.

## Strategy
- RBAC (Student/Instructor/Admin) + object scoping by owner.
- Immutable quiz submissions (server-enforced).
- Rich text sanitization allowlist.
- Rate limiting for login and quizzes.
- Session storage in MongoStore.
- File-type validation + size limits + AV scanning hook.
