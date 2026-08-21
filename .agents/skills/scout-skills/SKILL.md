---
name: scout-skills
description: Analyzes codebase patterns and proactively scaffolds new custom skills and slash commands.
---

# Skills & Commands Scout Skill (`/scout-skills`)

Identifies emerging code workflows and scaffolds reusable skills in `.agents/skills/<name>/SKILL.md` and commands in `.agents/commands/<name>.md`.

## Workflow:
1. Scan project directories for repeated manual steps or domain patterns.
2. Determine required inputs, execution steps, and verification procedures.
3. Generate standard YAML frontmatter `SKILL.md` and register the command in `.agents/AGENTS.md`.
