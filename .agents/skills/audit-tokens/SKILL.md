---
name: audit-tokens
description: Appends session token consumption metrics directly to audits/token_usage.md.
---

# Token Usage Audit Skill (`/audit-tokens`)

Logs input/output token consumption and operation summaries to `audits/token_usage.md`.

## Workflow:
1. Calculate or aggregate session token consumption.
2. Append markdown table row to `audits/token_usage.md` with date, model, task description, and total tokens.
3. Update running cumulative total.
