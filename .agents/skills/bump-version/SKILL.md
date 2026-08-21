---
name: bump-version
description: Increments version across package.json, audits/VERSION.md, docs/DOCUMENTATION.md, and in-app navbar badge.
---

# Version Bump Skill (`/bump-version [version]`)

Synchronizes semantic version numbers across all configuration and documentation targets.

## Workflow:
1. Update `"version"` in `main-code/package.json` and root `package.json`.
2. Add new release section to `audits/VERSION.md` with timestamp and changelog.
3. Update version references in `docs/DOCUMENTATION.md` and in-app badge components (`Sidebar.js` / `UserGuideModal.js`).
