# `/manage-vercel` - Vercel Ops & Environment Manager

## Overview
Automates complete Vercel lifecycle operations: CLI authentication check, workspace project linking (`taskpulse`), automated batch environment variable synchronization from `.env` to Vercel production without manual effort, pre-flight build diagnostics, and production deployment dispatch.

## Supported Modes & Flags:
- `/manage-vercel link` : Links local workspace to existing Vercel project (`my-my4/taskpulse`).
- `/manage-vercel inspect` : Scans and validates local `.env` variables required for Vercel deployment.
- `/manage-vercel sync-env` (or `push`) : Automatically uploads all local `.env` database, auth, and SMTP variables directly into Vercel production settings.
- `/manage-vercel pull-env` (or `pull`) : Downloads remote Vercel variables to `.env.production.local`.
- `/manage-vercel deploy` : Performs pre-flight build verification and triggers `npx vercel --prod`.
- `/manage-vercel status` : Checks the health and latest deployment status of `https://taskpulse.vercel.app`.

## Execution Script:
```powershell
node samples/scripts/sync_vercel_env.mjs [inspect|list|push|pull]
```
