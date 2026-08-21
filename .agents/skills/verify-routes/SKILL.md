---
name: verify-routes
description: Tests dynamic route generation for /share/[code] and CRUD API endpoints.
---

# Route & API Verification Skill (`/verify-routes`)

Validates Next.js App Router dynamic route parameters and API endpoint responses.

## Workflow:
1. Test dynamic route `/share/[code]` handling with valid 6-digit codes and invalid/expired codes.
2. Test `/api/db/tasks`, `/api/db/notes`, `/api/notifications/email`, and `/api/tokens`.
3. Verify status codes (200, 400, 404, 500) and structured JSON error responses.
