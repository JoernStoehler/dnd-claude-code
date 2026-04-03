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
| `CLAUDE.md` | `CLAUDE.md` | Campaign Premise, Repository Layout, Rule System, any section about SotS/Eversink/campaign content |
| `.claude/skills/` | `.claude/skills/` | Skills that are campaign-specific (e.g. `fal-flux-prompting`) |
| `.claude/hooks/` | `.claude/hooks/` | Nothing — hooks should match upstream unless there's a campaign-specific reason |
| `.claude/rules/` | `.claude/rules/` | Rules about campaign content |
| `.claude/settings.json` | `.claude/settings.json` | Nothing — should match upstream |

## Steps

1. **Get msc-math.** Clone or pull into `/tmp/msc-math`:
   ```
   git clone https://github.com/JoernStoehler/msc-math /tmp/msc-math 2>/dev/null || git -C /tmp/msc-math pull
   ```
2. **Diff each file pair.** For each row in the table above, compare upstream vs local. Focus on structural changes, new sections, reworded rules, new skills/hooks/rules.
3. **Pull in upstream changes.** Copy new agent workflow content. Keep local project-specific content intact. Don't merge mechanically — read both versions and produce the right result.
4. **Flag removals and conflicts.** If upstream removed something this repo still uses, or if a change conflicts with campaign-specific needs, flag to Jörn.
5. **Check for new files.** Look for skills, hooks, or rules in msc-math that don't exist here yet. Copy and adapt if they're general-purpose.
6. **Commit** with a message like `sync agent infrastructure from msc-math`.

## What NOT to sync

- Project-specific content (campaign, system, setting)
- Files that don't exist in msc-math (campaign-specific skills, etc.)
- msc-math project-specific content (math curriculum, course structure, etc.) — only agent workflow patterns
