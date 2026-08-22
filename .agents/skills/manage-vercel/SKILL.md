---
name: manage-vercel
description: Automated Vercel CLI connection, environment variables synchronization (push/pull), pre-flight deployment validation, and live production release management.
---

# Vercel Management & Automation Skill (`/manage-vercel`)

## Workflow Overview:
1. **Link & Connection Check**:
   - Check if `.vercel/` project metadata exists.
   - If not linked, guide or execute `npx vercel link` to bind the workspace to `my-my4/taskpulse`.
2. **Environment Variable Synchronization**:
   - Parse local `.env` values (Database, SMTP, App URLs, Redirect flags).
   - Execute `node samples/scripts/sync_vercel_env.mjs push` to automatically push variables to Vercel production without manual copy-pasting.
   - Execute `node samples/scripts/sync_vercel_env.mjs pull` to fetch remote Vercel variables to `.env.production.local`.
3. **Pre-flight Build Verification**:
   - Run `npm run build` locally to ensure zero hydration or route errors prior to remote deployment.
4. **Production Deployment & Status Verification**:
   - Trigger `npx vercel --prod` or inspect deployment status with `npx vercel inspect`.
   - Validate live endpoint responses (`/api/db/tasks`, `/api/notifications/email`).
