# `/build-check` - Pre-flight Next.js Build Verification

## Overview
Runs the Next.js production build command (`npm run build`) in `main-code/` to verify zero server-side rendering (SSR), hydration mismatch, or compilation errors prior to deployment on Vercel.

## Execution Workflow
1. Execute `npm run build` within `main-code/`.
2. Parse compiler stdout/stderr for warnings or errors.
3. Verify that all route segments (static, dynamic `/share/[code]`, API routes) compile successfully.
4. Report build status.
