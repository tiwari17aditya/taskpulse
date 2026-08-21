---
name: sync-docs
description: Reconciles recent feature additions across docs/DOCUMENTATION.md, in-app UserGuideModal.js, and audits/VERSION.md.
---

# Documentation Synchronization Skill (`/sync-docs`)

Ensures complete harmony between the code implementation, user manual, in-app tutorial/guide, and release versioning.

## Synchronization Checklist:
1. **User Manual**: Update `docs/DOCUMENTATION.md` with new features, keyboard shortcuts, or workflow changes.
2. **In-App User Guide**: Update `src/components/UserGuideModal.js` to match the latest feature additions and UI layouts.
3. **Release Tracker**: Append changes and version bumps to `audits/VERSION.md`.
4. **Interactive Badges**: Ensure in-app version badges in `src/components/Sidebar.js` or header match current release.
