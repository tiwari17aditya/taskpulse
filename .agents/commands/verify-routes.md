# `/verify-routes` - Dynamic Routes & REST Endpoints Tester

## Overview
Automates route testing for Next.js App Router dynamic endpoints (such as `/share/[code]`) and REST API CRUD routes to verify HTTP 200 responses and JSON schemas.

## Execution Workflow
1. Verify dynamic route handler `src/app/share/[code]/page.js`.
2. Test `/api/db/tasks` (GET, POST).
3. Test `/api/db/notes` (GET, POST).
4. Test `/api/db/profiles` (GET, POST).
5. Output route status report.
