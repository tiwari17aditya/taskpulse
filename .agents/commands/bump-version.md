# `/bump-version` - Unified Version Release Bumper

## Overview
Increments the project version across all references simultaneously to ensure no version drift between codebase, documentation, and UI display.

## Usage
- `/bump-version v1.2.1`
- `/bump-version 1.3.0`

## Execution Workflow
1. Update `"version"` in `main-code/package.json` and root `package.json`.
2. Add new release entry with changelog in `audits/VERSION.md`.
3. Update version headers and badge text in `docs/DOCUMENTATION.md`.
4. Update version badge in frontend header / sidebar UI components (`src/components/Sidebar.js` or `src/components/Header.js`).
