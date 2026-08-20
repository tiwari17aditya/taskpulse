# `/refine-prompt` - AI Prompt Optimizer & Context Enhancer

## Overview
Takes any rough or high-level prompt from the user, analyzes it against the active repository architecture, and crafts a structured, high-precision prompt. The user reviews the optimized prompt before execution to achieve maximum accuracy and zero hallucinated code.

## Usage
- `/refine-prompt <your-raw-task-or-question>`
- Or ask: *"Refine my prompt: <idea>"*

## Optimization Pipeline
1. **Intent Extraction**: Identifies the core objective (feature, bugfix, refactor, audit, or research).
2. **Context Enrichment**: Injects exact file paths, relevant component symbols, database schemas, and existing utilities from `src/`.
3. **Constraint Specification**: Enforces edge cases (SSR hydration, null safety, responsive design, type casting, dark mode tokens).
4. **Structured Format Output**:
   - **Goal & Problem Statement**
   - **Affected Files & APIs**
   - **Specific Step-by-Step Requirements**
   - **Verification & Acceptance Criteria**
5. **Interactive Review**: Displays the refined prompt in an easy-to-copy code block for user approval or one-click execution.
