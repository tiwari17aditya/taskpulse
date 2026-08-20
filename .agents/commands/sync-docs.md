# `/sync-docs` - Documentation & Version Reconciler

## Overview
Scans recently added or modified UI components, APIs, and configuration files, then synchronizes documentation across `docs/DOCUMENTATION.md`, in-app `UserGuideModal.js`, and `audits/VERSION.md`.

## Execution Workflow
1. Inspect git diff of recent changes in `src/`.
2. Update relevant sections of `docs/DOCUMENTATION.md` (Features, Architecture, Schemas).
3. Update interactive user guide modal `src/components/UserGuideModal.js`.
4. Update `audits/VERSION.md` with corresponding changes.
