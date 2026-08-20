# `/scout-skills` - Autonomous Skill & Command Scout

## Overview
Analyzes the entire workspace, inspects all existing commands in `.agents/commands/` and skills in `.agents/skills/`, and examines recent developer workflows. Identifies newly recurring tasks, missing domain skills, or boilerplate needs, and automatically scaffolds new command `.md` files or `.agents/skills/<name>/SKILL.md` playbooks.

## Execution Workflow
1. **Catalog Audit**:
   - Lists all files in `.agents/commands/` and `.agents/skills/`.
2. **Repository & Commit Analysis**:
   - Inspects recent features, database tables, and UI components in `src/`.
   - Identifies areas lacking dedicated testing, scaffolding, or maintenance commands.
3. **Propose & Scaffold**:
   - Generates structured `.md` files with clear descriptions, preconditions, and execution workflows.
   - Registers new commands in `.agents/commands/COMMANDS.md` and `.agents/AGENTS.md`.
4. **Report**:
   - Outputs a summary of identified gaps and newly created skill/command artifacts.
