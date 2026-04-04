---
name: sync-claude
description: Sync agent infrastructure (CLAUDE.md, .claude/) from msc-math upstream. Run when touching these files or periodically to pick up improvements.
---

# Sync Agent Infrastructure from msc-math

Upstream source of truth for agent workflows: `JoernStoehler/msc-math`.

This repo tracks msc-math's agent infrastructure patterns. msc-math owns the agent workflow/rules content; this repo replaces only project-specific sections (campaign premise, repo layout, system rules, etc.).

## Files to sync

| This repo | Upstream (msc-math) | What to keep local |
|---|---|---|
| `CLAUDE.md` | `CLAUDE.md` | Campaign Premise, Repository Layout, Rule System, Core Conventions, any section about SotS/Eversink/campaign content |
| `.claude/skills/` | `.claude/skills/` | Skills that are campaign-specific (e.g. `fal-flux-prompting`, `sync-claude`) |
| `.claude/hooks/` | `.claude/hooks/` | `session-start.sh` (campaign-specific setup) |
| `.claude/agents/` | `.claude/agents/` | Nothing — agents should match upstream |
| `.claude/rules/` | `.claude/rules/` | Rules about campaign content |
| `.claude/settings.json` | `.claude/settings.json` | `permissions`, git env vars, `PreCompact` hook — these are local safety settings |

## Steps

1. **Get msc-math.** Clone or pull into `/tmp/msc-math`:
   ```
   git clone https://github.com/JoernStoehler/msc-math /tmp/msc-math 2>/dev/null || git -C /tmp/msc-math pull
   ```
2. **Diff each file pair.** For each row in the table above, compare upstream vs local. Focus on structural changes, new sections, reworded rules, new skills/hooks/rules.
3. **Copy files with `cp`.** Use `cp` to copy upstream files, then `Edit` for targeted path/reference fixes (`-workspaces-msc-math` → `-workspaces-dnd-claude-code`). Never rewrite files from memory via Write — that wastes tokens and introduces drift.
4. **CLAUDE.md special handling.** Copy upstream CLAUDE.md, then replace project-specific sections (Project, Project Layout, Core Rule specifics, Git, Environment, Quick Commands) with campaign equivalents (Campaign Premise, Repository Layout, Rule System, Core Conventions). Keep all agent workflow sections from upstream verbatim.
5. **Flag removals and conflicts.** If upstream removed something this repo still uses, or if a change conflicts with campaign-specific needs, flag to Jörn.
6. **Check for new files.** Look for skills, hooks, agents, or rules in msc-math that don't exist here yet. Copy them.
7. **Commit** with a message like `sync agent infrastructure from msc-math`.

## What NOT to sync

- Campaign-specific content in this repo (SotS, Eversink, sessions/, library/sots/)
- Files that don't exist in msc-math (campaign-specific skills, etc.)
- msc-math project-specific content (Rust crates, thesis, experiments, math.tex, bibliography) — these stay in upstream skills as-is since they won't trigger in this project's context
