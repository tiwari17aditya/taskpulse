---
name: build-check
description: Runs pre-flight Next.js build verification to detect hydration mismatches or compilation errors prior to deployment.
---

# Build Verification Skill (`/build-check`)

## Workflow:
1. Run `npm run build` inside `main-code/`.
2. Inspect output for any SSR hydration errors, broken imports, or missing environment variables.
3. Confirm `.next/standalone` or production artifacts are generated cleanly.
