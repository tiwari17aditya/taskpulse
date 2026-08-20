---
name: test-email
description: Dispatches a formatted test HTML email payload with quote/proverb banner via /api/notifications/email to verify SMTP.
---

# Email Diagnostics Skill (`/test-email`)

## Workflow:
1. Verify SMTP credentials in `.env` (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`).
2. Construct HTML payload including dark mode task summary and quote banner.
3. Post to `/api/notifications/email`.
4. Validate recipient address handling and return dispatch status.
