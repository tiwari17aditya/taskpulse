# `/audit-tokens` - Token Usage Tracker

## Overview
Computes the current session's input and output token consumption and appends a structured record to `audits/token_usage.md`.

## Execution Workflow
1. Calculate approximate prompt and completion tokens for the active work session.
2. Read `audits/token_usage.md`.
3. Append a new table row with Date, Feature/Operation, Input Tokens, Output Tokens, and Total.
4. Save and format the markdown table.
