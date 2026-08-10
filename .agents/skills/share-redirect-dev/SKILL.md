---
name: share-redirect-dev
description: Guidelines for Codeshare and Toffeeshare secret share code links, 6-digit access code generation, and URL dynamic redirection.
---

# Share & Redirect Link Skill Guidelines

When editing instant share or URL redirect features:
1. Refer to `src/app/api/share/route.js` for 6-digit secret code generation and JSON store.
2. Refer to `src/app/share/[code]/page.js` for dynamic redirection routing.
3. Refer to `src/components/ShareRedirectModal.js` for UI share link copy dialogs.
