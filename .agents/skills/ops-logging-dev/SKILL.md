---
name: ops-logging-dev
description: Guidelines for managing operational tracking files: token_usage.md, logs/log_YYYY-MM-DD.log, VERSION.md, and ENHANCEMENTS.md.
---

# Operational Logging Skill Guidelines

When maintaining operational tracking files:
1. `token_usage.md`: Must maintain Markdown table schema `| Date | Session / Chat ID | Input Tokens | Output Tokens | Total Tokens | Estimated Cost ($) | Status / Notes |`.
2. `logs/log_YYYY-MM-DD.log`: Daily log format `[YYYY-MM-DD HH:MM:SS] [LEVEL] Message`.
3. `VERSION.md`: Follow Semantic Versioning format (`v1.0.0-alpha`).
4. `ENHANCEMENTS.md`: Maintain feature proposals (including LDAP integration).
