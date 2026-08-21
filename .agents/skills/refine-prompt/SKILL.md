---
name: refine-prompt
description: Optimizes and enriches user prompts with repository context and constraints for maximum output precision.
---

# Prompt Refinement Skill (`/refine-prompt`)

Transforms underspecified or ambiguous prompts into structured, actionable engineering tasks with context links and constraints.

## Refinement Rules:
1. Identify primary goal, affected directories (`src/components/`, `src/lib/`, `src/app/api/`), and dependencies.
2. Establish validation criteria and non-regression boundaries.
3. Supply precise file references and API schemas.
