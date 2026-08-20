# `/test-email` - Nodemailer SMTP & Quote Template Verification

## Overview
Dispatches a test HTML email payload containing the dark-mode formatted task table and inspirational quote/proverb banner via the `/api/notifications/email` serverless route.

## Execution Workflow
1. Check SMTP credentials in `.env` (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`).
2. Verify recipient address exists (or prompt user if missing).
3. Send POST request to `/api/notifications/email` with mock task items and quote.
4. Report SMTP delivery status or specific error codes.
