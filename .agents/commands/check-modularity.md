# `/check-modularity` - Architectural Modularity & Code Health Auditor

## Overview
Analyzes the codebase for monolithic files, high coupling, code duplication, and inline domain logic. Automatically identifies candidates for decomposition into clean, reusable sub-components, custom hooks, and domain libraries in `src/lib/`.

## Modularity Standard Guidelines
1. **Component Length**: Target component file size is < 400-500 lines. Monolithic files exceeding 800 lines should have drawers, modals, or calendar grids extracted into dedicated sub-components.
2. **Domain Logic Isolation**: Complex business rules (e.g., streak calculations, date math, tag harvesting, routine auto-population) must reside in `src/lib/` domain utility modules, never inlined directly in UI views.
3. **Shared Utilities**: Date/time formatters, timezone-safe helpers, and color palettes must be centralized in `src/lib/` rather than redefined across individual components.

## Execution Workflow
1. **Static Analysis Scan**:
   - Inspect files in `src/components/` and `src/app/`.
   - Flag files with line counts > 500 or multiple competing concerns.
2. **Coupling & Duplication Detection**:
   - Check for duplicate helper functions across different views (e.g. date formatting, tag parsing).
3. **Automated Refactoring & Decomposition**:
   - Extract embedded drawers, modals, and charts into `src/components/<feature-name>/`.
   - Extract calculations, business algorithms, and sanitizers into `src/lib/<domain>Utils.js`.
4. **Verification**:
   - Run Next.js production build (`npm.cmd run build`) to ensure 100% type and compilation integrity.
